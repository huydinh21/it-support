import { useState, useEffect } from 'react';
import { mockRepairHistory as initialRepairs, type RepairHistory } from './data/mockRepairHistory';
import { mockPolicies as initialPolicies, type Policy } from './data/mockPolicies';
import { 
  Sun, Moon, Search, Wrench, FileText, X, 
  CheckCircle2, Clock, AlertCircle, Calendar, 
  User, CreditCard, Shield, ExternalLink, Info,
  ChevronRight, Edit2, Save, Plus, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app-theme') as 'light' | 'dark') || 'dark';
  });

  // Data state
  const [repairs, setRepairs] = useState<RepairHistory[]>(() => {
    const saved = localStorage.getItem('app-repairs');
    return saved ? JSON.parse(saved) : initialRepairs;
  });
  
  const [policies, setPolicies] = useState<Policy[]>(() => {
    const saved = localStorage.getItem('app-policies');
    return saved ? JSON.parse(saved) : initialPolicies;
  });

  const [logs, setLogs] = useState<{id: string, time: string, msg: string}[]>(() => {
    const saved = localStorage.getItem('app-logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Auth & UI state
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'repair' | 'policy' | 'logs'>('repair');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepair, setSelectedRepair] = useState<RepairHistory | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [editingItem, setEditingItem] = useState<{ type: 'repair' | 'policy', data: any, isNew?: boolean } | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app-repairs', JSON.stringify(repairs));
  }, [repairs]);

  useEffect(() => {
    localStorage.setItem('app-policies', JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem('app-logs', JSON.stringify(logs));
  }, [logs]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const addLog = (msg: string) => {
    setLogs(prev => [{ id: Date.now().toString(), time: new Date().toLocaleString('vi-VN'), msg }, ...prev]);
  };

  const handleAddNew = () => {
    if (activeTab === 'repair') {
      const newRepair: RepairHistory = {
        id: `RH${Date.now()}`,
        machineId: 'M' + Math.floor(Math.random() * 1000),
        machineName: '',
        machineType: 'Chưa xác định',
        repairDate: new Date().toISOString().split('T')[0],
        repairedBy: '',
        problem: '',
        solution: '',
        cost: 0,
        status: 'in-progress',
        partsReplaced: [],
        notes: ''
      };
      setEditingItem({ type: 'repair', data: newRepair, isNew: true });
    } else {
      const newPolicy: Policy = {
        id: `POL${Date.now()}`,
        title: '',
        category: 'general',
        status: 'draft',
        issuedDate: new Date().toISOString().split('T')[0],
        effectiveDate: new Date().toISOString().split('T')[0],
        content: '<h2>Nội dung mới</h2><p>Mô tả chính sách tại đây...</p>',
        createdBy: 'Admin',
        attachments: []
      };
      setEditingItem({ type: 'policy', data: newPolicy, isNew: true });
    }
  };

  const handleSaveRepair = (item: RepairHistory) => {
    if (editingItem?.isNew) {
      setRepairs([item, ...repairs]);
      addLog(`[${role === 'admin' ? 'Admin' : 'Nhân viên'}] Đã ${role === 'admin' ? 'thêm mới' : 'tạo yêu cầu'} thiết bị: ${item.machineName || 'Chưa đặt tên'}`);
    } else {
      setRepairs(repairs.map(r => r.id === item.id ? item : r));
      addLog(`[Admin] Đã cập nhật thiết bị: ${item.machineName}`);
    }
    setEditingItem(null);
  };

  const handleSavePolicy = (item: Policy) => {
    if (editingItem?.isNew) {
      setPolicies([item, ...policies]);
      addLog(`[${role === 'admin' ? 'Admin' : 'Nhân viên'}] Đã ${role === 'admin' ? 'thêm' : 'tạo yêu cầu'} chính sách: ${item.title || 'Chưa đặt tên'}`);
    } else {
      setPolicies(policies.map(p => p.id === item.id ? item : p));
      addLog(`[Admin] Đã cập nhật chính sách: ${item.title}`);
    }
    setEditingItem(null);
  };

  const handleDeleteRepair = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      const target = repairs.find(r => r.id === id);
      setRepairs(repairs.filter(r => r.id !== id));
      addLog(`[Admin] Đã xóa lịch sử thiết bị: ${target?.machineName}`);
      setSelectedRepair(null);
      setEditingItem(null);
    }
  };

  const handleDeletePolicy = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa chính sách này?')) {
      const target = policies.find(p => p.id === id);
      setPolicies(policies.filter(p => p.id !== id));
      addLog(`[Admin] Đã xóa chính sách: ${target?.title}`);
      setSelectedPolicy(null);
      setEditingItem(null);
    }
  };

  const filteredRepairs = repairs.filter(item => 
    item.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.problem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPolicies = policies.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', boxShadow: 'var(--shadow)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Shield size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{authView === 'login' ? 'Đăng nhập RMG' : 'Đăng ký tài khoản'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {authView === 'login' 
                ? 'Gợi ý: Tài khoản Admin (admin / admin@123) hoặc NV (nv01 / 123456)' 
                : 'Đăng ký tài khoản mới.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tên đăng nhập / Mã NV</label>
              <input type="text" className="form-input" style={{ width: '100%' }} value={username} onChange={e => setUsername(e.target.value)} placeholder="VD: admin, nv01..." />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Mật khẩu</label>
              <input type="password" className="form-input" style={{ width: '100%' }} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            
            <button 
              className="tab-btn active" 
              style={{ width: '100%', marginTop: '1rem', padding: '1rem', justifyContent: 'center', background: 'var(--primary)', borderRadius: '12px' }}
              onClick={() => {
                if(!username || !password) return alert('Vui lòng nhập đủ thông tin!');
                
                if (authView === 'login') {
                  if (username === 'admin' && password === 'admin@123') {
                    setRole('admin');
                    setIsAuthenticated(true);
                    addLog(`[Hệ thống] Quản trị viên đã đăng nhập.`);
                  } else if (username === 'nv01' && password === '123456') {
                    setRole('staff');
                    setIsAuthenticated(true);
                    addLog(`[Hệ thống] Nhân viên [nv01] đã đăng nhập.`);
                  } else {
                    return alert('Tên đăng nhập hoặc mật khẩu không chính xác!');
                  }
                } else {
                  return alert('Tính năng Đăng ký đã bị khóa trong bản Demo này!');
                }
                
                setUsername('');
                setPassword('');
              }}
            >
              {authView === 'login' ? 'Đăng nhập ngay' : 'Đăng ký'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {authView === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}>
                {authView === 'login' ? 'Đăng ký' : 'Đăng nhập'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Hệ thống Quản lý RMG</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Quản lý Lịch sử sửa chữa & Chính sách nội quy</p>
        </motion.div>
        
        {/* Toggle Role UI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <User size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tài khoản:</span>
          <div style={{ padding: '0.3rem 0.5rem', borderRadius: '8px', background: 'var(--bg-main)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
            {role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
          </div>
        </div>
        <button className="tab-btn" style={{ marginLeft: '1rem', background: 'var(--danger)', color: 'white' }} onClick={() => setIsAuthenticated(false)}>
           Đăng xuất
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'repair' ? 'active' : ''}`} onClick={() => setActiveTab('repair')}>
              <Wrench size={18} /> Sửa chữa
            </button>
            <button className={`tab-btn ${activeTab === 'policy' ? 'active' : ''}`} onClick={() => setActiveTab('policy')}>
              <FileText size={18} /> Chính sách
            </button>
            {role === 'admin' && (
              <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')} style={{ borderLeft: '1px solid var(--border)', borderRadius: 0, paddingLeft: '1rem', marginLeft: '0.2rem' }}>
                <Clock size={18} /> Lịch sử thao tác
              </button>
            )}
          </div>
            <button 
              className="tab-btn active" 
              style={{ borderRadius: '14px', background: 'var(--accent)', padding: '0.8rem 1.5rem' }}
              onClick={handleAddNew}
            >
              <Plus size={20} /> Thêm mới
            </button>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder={`Tìm kiếm trong ${activeTab === 'repair' ? 'tên máy, lỗi sửa chữa...' : 'tiêu đề, danh mục chính sách...'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '15px',
              border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', boxShadow: 'var(--shadow)'
            }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className={activeTab === 'logs' ? '' : 'grid-view'} style={activeTab === 'logs' ? {width: '100%', maxWidth: '600px', margin: '0 auto'} : {}}>
          {activeTab === 'repair' ? (
            filteredRepairs.map((repair) => (
              <RepairCard key={repair.id} repair={repair} onClick={() => setSelectedRepair(repair)} onEdit={() => {}} />
            ))
          ) : activeTab === 'policy' ? (
            filteredPolicies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} onClick={() => setSelectedPolicy(policy)} onEdit={() => {}} />
            ))
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '15px' }}>Chưa có lịch sử thêm/sửa nào được ghi nhận.</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} style={{ padding: '1rem 1.5rem', background: 'var(--bg-card)', borderRadius: '12px', borderLeft: log.msg.includes('xóa') ? '4px solid var(--danger)' : log.msg.includes('cập nhật') ? '4px solid var(--accent)' : '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Clock size={14} /> {log.time}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{log.msg}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRepair && (
          <DetailModal onClose={() => setSelectedRepair(null)}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {role === 'admin' ? (
                <>
                  <button className="tab-btn active" style={{ flex: 1 }} onClick={() => { setEditingItem({ type: 'repair', data: selectedRepair }); setSelectedRepair(null); }}>
                    <Edit2 size={16} /> Chỉnh sửa
                  </button>
                  <button className="tab-btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }} onClick={() => handleDeleteRepair(selectedRepair.id)}>
                    <Trash2 size={16} /> Xóa
                  </button>
                </>
              ) : (
                <button className="tab-btn active" style={{ flex: 1, background: 'var(--primary)' }} onClick={() => {
                  const req = window.prompt('Nhập yêu cầu sửa chữa bổ sung cho lỗi này:');
                  if(req) alert('Yêu cầu đã được gửi cho kĩ thuật!');
                }}>
                  <AlertCircle size={16} /> Báo cáo / Yêu cầu
                </button>
              )}
            </div>
            <RepairDetail repair={selectedRepair} />
          </DetailModal>
        )}
        {selectedPolicy && (
          <DetailModal onClose={() => setSelectedPolicy(null)}>
            {role === 'admin' && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button className="tab-btn active" style={{ flex: 1 }} onClick={() => { setEditingItem({ type: 'policy', data: selectedPolicy }); setSelectedPolicy(null); }}>
                  <Edit2 size={16} /> Chỉnh sửa
                </button>
                <button className="tab-btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }} onClick={() => handleDeletePolicy(selectedPolicy.id)}>
                  <Trash2 size={16} /> Xóa
                </button>
              </div>
            )}
            <PolicyDetail policy={selectedPolicy} onAttachmentClick={(e, f) => alert(`Dữ liệu mẫu: ${f}`)} />
          </DetailModal>
        )}
      </AnimatePresence>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {editingItem && (
          <DetailModal onClose={() => setEditingItem(null)}>
            {editingItem.type === 'repair' ? (
              <RepairEditForm data={editingItem.data} isNew={editingItem.isNew} role={role} onSave={(item) => {
                handleSaveRepair(item);
                if (role === 'staff') alert('Phiếu yêu cầu cửa bạn đã được gửi cho Quản lý!');
              }} onCancel={() => setEditingItem(null)} />
            ) : (
              <PolicyEditForm data={editingItem.data} isNew={editingItem.isNew} role={role} onSave={(item) => {
                handleSavePolicy(item);
                if (role === 'staff') alert('Phiếu yêu cầu cửa bạn đã được gửi cho Quản lý!');
              }} onCancel={() => setEditingItem(null)} />
            )}
          </DetailModal>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Card Components ---

function RepairCard({ repair, onClick, onEdit }: { repair: RepairHistory, onClick: () => void, onEdit: () => void }) {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-header">
        <div>
          <div className="card-title">{repair.machineName || 'Chưa đặt tên'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{repair.machineId}</div>
        </div>
        <div className={`badge badge-${repair.status}`}>{repair.status}</div>
      </div>
      <div style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>{repair.problem || 'Chưa nhập lỗi...'}</div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14} /> {repair.repairDate}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 700 }}>Xem chi tiết <ChevronRight size={14} /></div>
        </div>
      </div>
    </div>
  );
}

function PolicyCard({ policy, onClick, onEdit }: { policy: Policy, onClick: () => void, onEdit: () => void }) {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-header">
        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>{policy.category}</div>
        <div className={`badge badge-${policy.status}`}>{policy.status}</div>
      </div>
      <div className="card-title" style={{ marginBottom: '1rem' }}>{policy.title || 'Chính sách không tiêu đề'}</div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <span>Tạo bởi: {policy.createdBy}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 700 }}>Xem chi tiết <ChevronRight size={14} /></div>
        </div>
      </div>
    </div>
  );
}

// --- Detail Components ---

function RepairDetail({ repair }: { repair: RepairHistory }) {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>{repair.machineName}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <DetailItem label="Mã thiết bị" value={repair.machineId} />
        <DetailItem label="Loại máy" value={repair.machineType} />
        <DetailItem label="Ngày sửa" value={repair.repairDate} />
        <DetailItem label="Người thực hiện" value={repair.repairedBy} />
        <DetailItem label="Chi phí" value={`${repair.cost.toLocaleString()} đ`} valueStyle={{ color: 'var(--accent)', fontWeight: 700 }} />
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '0.8rem', color: 'var(--text-muted)' }}>Mô tả lỗi:</h4>
        <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border)' }}>{repair.problem}</div>
      </div>
      <div>
        <h4 style={{ marginBottom: '0.8rem', color: 'var(--text-muted)' }}>Cách xử lý:</h4>
        <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border)' }}>{repair.solution}</div>
      </div>
    </div>
  );
}

function PolicyDetail({ policy, onAttachmentClick }: { policy: Policy, onAttachmentClick: (e: any, f: string) => void }) {
  return (
    <div>
      <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.5rem' }}>LĨNH VỰC: {policy.category.toUpperCase()}</div>
      <h2 style={{ marginBottom: '1.5rem', lineHeight: '1.4' }}>{policy.title}</h2>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <DetailItem label="Ngày ban hành" value={policy.issuedDate} />
        <DetailItem label="Trạng thái" value={policy.status} />
      </div>
      <div className="policy-content" dangerouslySetInnerHTML={{ __html: policy.content }} />
    </div>
  );
}

// --- Form Components ---

function RepairEditForm({ data, isNew, role, onSave, onCancel }: { data: RepairHistory, isNew?: boolean, role?: string, onSave: (d: RepairHistory) => void, onCancel: () => void }) {
  const [f, setF] = useState({ ...data });
  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>{role === 'staff' ? '📝 Lập phiếu yêu cầu' : isNew ? '✨ Thêm lịch sử mới' : '📝 Sửa lịch sử'}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormComp label="Tên thiết bị"><input className="form-input" value={f.machineName} onChange={e => setF({...f, machineName: e.target.value})} placeholder="VD: Máy cắt CNC" /></FormComp>
        <FormComp label="Mã thiết bị"><input className="form-input" value={f.machineId} onChange={e => setF({...f, machineId: e.target.value})} /></FormComp>
        <FormComp label="Ngày báo lỗi"><input className="form-input" type="date" value={f.repairDate} onChange={e => setF({...f, repairDate: e.target.value})} /></FormComp>
        <FormComp label="Dự kiến chi phí (nếu có)"><input className="form-input" type="number" value={f.cost} onChange={e => setF({...f, cost: Number(e.target.value)})} /></FormComp>
        <FormComp label="Mô tả tình trạng hỏng hóc" fullW><textarea className="form-input" rows={3} value={f.problem} onChange={e => setF({...f, problem: e.target.value})} /></FormComp>
        {role === 'admin' && <FormComp label="Giải pháp (Chỉ kĩ thuật ghi)" fullW><textarea className="form-input" rows={3} value={f.solution} onChange={e => setF({...f, solution: e.target.value})} /></FormComp>}
      </div>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button className="tab-btn" onClick={onCancel}>Hủy bỏ</button>
        <button className="tab-btn active" onClick={() => onSave(f)}>{role === 'staff' ? 'Gửi yêu cầu đi' : 'Lưu thông tin'}</button>
      </div>
    </div>
  );
}

function PolicyEditForm({ data, isNew, role, onSave, onCancel }: { data: Policy, isNew?: boolean, role?: string, onSave: (d: Policy) => void, onCancel: () => void }) {
  const [f, setF] = useState({ ...data });
  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>{role === 'staff' ? '📄 Yêu cầu hỗ trợ/thắc mắc chính sách' : isNew ? '📄 Thêm chính sách mới' : '📝 Sửa chính sách'}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormComp label="Tiêu đề / Nguyện vọng" fullW><input className="form-input" value={f.title} onChange={e => setF({...f, title: e.target.value})} /></FormComp>
        <FormComp label="Phòng ban"><input className="form-input" value={f.createdBy} onChange={e => setF({...f, createdBy: e.target.value})} /></FormComp>
        <FormComp label="Danh mục">
          <select className="form-input" value={f.category} onChange={e => setF({...f, category: e.target.value as any})}>
            <option value="hr">Nhân sự</option><option value="it">Công nghệ</option><option value="safety">An toàn</option><option value="general">Khác</option>
          </select>
        </FormComp>
        <FormComp label="Chi tiết nội dung" fullW><textarea className="form-input" rows={10} value={f.content} onChange={e => setF({...f, content: e.target.value})} style={{ fontFamily: 'monospace' }} /></FormComp>
      </div>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button className="tab-btn" onClick={onCancel}>Hủy bỏ</button>
        <button className="tab-btn active" onClick={() => onSave(f)}>{role === 'staff' ? 'Gửi yêu cầu đi' : 'Lưu chính sách'}</button>
      </div>
    </div>
  );
}

// --- Utils ---

function DetailModal({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        {children}
      </motion.div>
    </motion.div>
  );
}

function DetailItem({ label, value, valueStyle }: { label: string, value: string, valueStyle?: any }) {
  return (
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontWeight: 600, ...valueStyle }}>{value}</div>
    </div>
  );
}

function FormComp({ label, children, fullW }: { label: string, children: React.ReactNode, fullW?: boolean }) {
  return (
    <div style={{ gridColumn: fullW ? '1 / span 2' : 'auto' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>{label}</label>
      {children}
    </div>
  );
}

export default App;
