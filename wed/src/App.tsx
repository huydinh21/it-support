import { useState, useEffect } from 'react';
import { mockRepairHistory as initialRepairs, mockTechnicians, mockAssets, type RepairHistory } from './data/mockRepairHistory';
import { mockPolicies as initialPolicies, type Policy } from './data/mockPolicies';
import { mockUsers as initialUsers, type UserAccount } from './data/mockUsers';
import { 
  Sun, Moon, Search, Wrench, FileText, X, 
  CheckCircle2, Clock, AlertCircle, Calendar, 
  User, CreditCard, Shield, ExternalLink, Info,
  ChevronRight, Edit2, Save, Plus, Trash2, QrCode, Wifi, Cpu, Printer, HelpCircle,
  Filter, BarChart3, Users, Briefcase, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

// Thành phần biểu đồ cột mini (Custom Bar Chart)
function ChartBar({ value, max, color, label }: { value: number, max: number, color: string, label: string }) {
  const height = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px', height: '100%' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: color }}>{value}</div>
      <div style={{ width: '100%', maxWidth: '30px', background: 'var(--bg-main)', borderRadius: '6px', flex: 1, position: 'relative', overflow: 'hidden' }}>
        <motion.div 
          initial={{ height: 0 }} 
          animate={{ height: `${height}%` }} 
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: color, borderRadius: '4px' }}
        />
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{label}</div>
    </div>
  );
}

function App() {
  // =========================================================
  // 1. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)
  // Quản lý các dữ liệu local, theme, auth và lịch sử sửa chữa
  // =========================================================

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app-theme') as 'light' | 'dark') || 'light';
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

  // Auth & UI state: Lưu trữ tài khoản và vai trò (Role)
  // Vai trò 'admin' sẽ FULL QUYỀN, 'staff' chỉ được XEM và YÊU CẦU.
  const [role, setRole] = useState<'admin' | 'staff'>(() => {
    return (localStorage.getItem('app-role') as any) || 'staff';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('app-is-auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('app-user-info');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('app-role', role);
    localStorage.setItem('app-is-auth', isAuthenticated.toString());
    localStorage.setItem('app-user-info', JSON.stringify(currentUser));
  }, [role, isAuthenticated, currentUser]);

  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');


  // UI state
  const [activeTab, setActiveTab] = useState<'repair' | 'policy' | 'logs' | 'users'>('repair');

  // Quản lý danh sách tài khoản (Chỉ Admin)
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('app-users');
    if (!saved) return initialUsers;
    const parsed: UserAccount[] = JSON.parse(saved);
    // Đảm bảo các tài khoản cũ đều có status là 'approved'
    return parsed.map(u => ({
      ...u,
      status: u.status || 'approved'
    }));
  });


  useEffect(() => {
    localStorage.setItem('app-users', JSON.stringify(users));
  }, [users]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepair, setSelectedRepair] = useState<RepairHistory | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [editingItem, setEditingItem] = useState<{ type: 'repair' | 'policy' | 'user', data: any, isNew?: boolean } | null>(null);
  // State ẩn/hiện modal nhập mã QR thiết bị
  const [showQR, setShowQR] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [adminFilters, setAdminFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });

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

  // =========================================================
  // 2. HÀM XỬ LÝ NGHIỆP VỤ (BUSINESS LOGIC)
  // Các hàm tương tác thêm, sửa, xóa, ghi log theo quyền
  // =========================================================

  // Hàm ghi lại thao tác của hệ thống (chỉ hiển thị cho Admin)
  const addLog = (msg: string) => {
    setLogs(prev => [{ id: Date.now().toString(), time: new Date().toLocaleString('vi-VN'), msg }, ...prev]);
  };

  // Khởi tạo một form trống để chuẩn bị thêm Mới/Yêu cầu
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
        priority: 'medium',
        deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0], // Mặc định hạn 7 ngày
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

  // Lọc dữ liệu theo Search và Bộ lọc Admin nâng cao
  const getFilteredRepairs = () => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = repairs.filter(r => {
      const matchSearch = (r.machineName || '').toLowerCase().includes(lowerSearch) || 
                         (r.machineId || '').toLowerCase().includes(lowerSearch) ||
                         (r.problem || '').toLowerCase().includes(lowerSearch);
      const matchStatus = adminFilters.status === 'all' || r.status === adminFilters.status;
      const matchPriority = adminFilters.priority === 'all' || ((r as any).priority || 'medium') === adminFilters.priority;
      
      return matchSearch && matchStatus && matchPriority;
    });

    // Sắp xếp: Mới nhất lên đầu
    return filtered.sort((a, b) => new Date(b.repairDate).getTime() - new Date(a.repairDate).getTime());
  };


  // Tính toán số liệu thống kê (Stats for Dashboard)
  const stats = {
    total: repairs.length,
    completed: repairs.filter(r => r.status === 'completed').length,
    pending: repairs.filter(r => r.status === 'in-progress' || r.status === 'waiting-parts').length,
    slaViolated: repairs.filter(r => r.status !== 'completed' && (r as any).deadline && new Date((r as any).deadline) < new Date()).length,
    byPriority: {
      urgent: repairs.filter(r => (r as any).priority === 'urgent').length,
      high: repairs.filter(r => (r as any).priority === 'high').length,
      medium: repairs.filter(r => (r as any).priority === 'medium' || !(r as any).priority).length,
      low: repairs.filter(r => (r as any).priority === 'low').length,
    },
    byStatus: {
      inProgress: repairs.filter(r => r.status === 'in-progress').length,
      waiting: repairs.filter(r => r.status === 'waiting-parts').length,
      completed: repairs.filter(r => r.status === 'completed').length,
    }
  };

  // =========================================================
  // 3. XỬ LÝ GIAO DIỆN (RENDER UI) VÀ PHÂN QUYỀN TRUY CẬP
  // =========================================================

  // MÀN HÌNH ĐĂNG NHẬP / MOCKUP XÁC THỰC
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

            {authView === 'register' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Họ và Tên</label>
                  <input type="text" className="form-input" style={{ width: '100%' }} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="VD: Nguyễn Văn A" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email công ty</label>
                  <input type="email" className="form-input" style={{ width: '100%' }} value={email} onChange={e => setEmail(e.target.value)} placeholder="email@rmg.vn" />
                </div>
              </>
            )}

            
            <button 
              className="tab-btn active" 
              style={{ width: '100%', marginTop: '1rem', padding: '1rem', justifyContent: 'center', background: 'var(--primary)', borderRadius: '12px' }}
              onClick={() => {
                if(!username || !password) return alert('Vui lòng nhập đủ thông tin!');
                
                if (authView === 'login') {
                  const foundUser = users.find(u => u.username === username && u.password === password);
                  if (foundUser) {
                    if (foundUser.status === 'pending') {
                      return alert('Tài khoản của bạn đang chờ Admin phê duyệt. Vui lòng quay lại sau!');
                    }
                    setRole(foundUser.role);
                    setCurrentUser(foundUser);
                    setIsAuthenticated(true);
                    addLog(`[Hệ thống] ${foundUser.fullName} (${foundUser.role}) đã đăng nhập.`);
                  } else {
                    return alert('Tên đăng nhập hoặc mật khẩu không chính xác!');
                  }
                } else {
                  // Xử lý Đăng ký
                  if(!username || !password || !fullName || !email) return alert('Vui lòng nhập đầy đủ các trường!');
                  const exists = users.find(u => u.username === username);
                  if(exists) return alert('Tên đăng nhập đã tồn tại!');
                  
                  const newUser: UserAccount = {
                    id: 'U' + Date.now(),
                    username,
                    password,
                    fullName,
                    email,
                    role: 'staff',
                    status: 'pending',
                    createdAt: new Date().toISOString().split('T')[0]
                  };
                  setUsers([...users, newUser]);
                  addLog(`[Hệ thống] Yêu cầu đăng ký mới từ: ${fullName} (${username})`);
                  alert('Đăng ký thành công! Vui lòng chờ Admin phê duyệt tài khoản trước khi đăng nhập.');
                  setAuthView('login');
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

      <div className="page-wrapper" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Hệ thống Quản lý RMG</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Quản lý Lịch sử sửa chữa & Chính sách nội quy</p>
        </motion.div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <User size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tài khoản:</span>
          <div style={{ padding: '0.3rem 0.5rem', borderRadius: '8px', background: 'var(--bg-main)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
            {role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
          </div>
          {currentUser && (
            <div style={{ marginLeft: '0.5rem', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
               {currentUser.fullName}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {role === 'admin' && (
            <button className="tab-btn" style={{ background: 'var(--primary)', color: 'white' }} onClick={() => { window.location.reload(); }}>
              Làm mới trang
            </button>
          )}

          <button className="tab-btn" style={{ background: 'var(--danger)', color: 'white' }} onClick={() => setIsAuthenticated(false)}>
            Đăng xuất
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'repair' ? 'active' : ''}`} onClick={() => setActiveTab('repair')}>
              <Wrench size={18} /> Sửa chữa
            </button>
            <button className={`tab-btn ${activeTab === 'policy' ? 'active' : ''}`} onClick={() => setActiveTab('policy')}>
              <FileText size={18} /> Chính sách
            </button>
            {role === 'admin' && (
              <>
                <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                  <Users size={18} /> Tài khoản
                </button>
                <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')} style={{ borderLeft: '1px solid var(--border)', borderRadius: 0, paddingLeft: '1rem', marginLeft: '0.2rem' }}>
                  <Clock size={18} /> Lịch sử thao tác
                </button>
              </>
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

        {activeTab === 'repair' && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: role === 'admin' ? '1rem' : '0' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input className="form-input" style={{ width: '100%', paddingLeft: '3rem' }} placeholder="Tìm kiếm theo tên máy, mã số hoặc lỗi..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            
            {role === 'admin' && (
              <>
                <button className={`tab-btn ${showDashboard ? 'active' : ''}`} onClick={() => setShowDashboard(!showDashboard)}>
                  <BarChart3 size={18} /> {showDashboard ? 'Ẩn Thống kê' : 'Dashboard'}
                </button>
                <select className="form-input" style={{ width: 'auto' }} value={adminFilters.status} onChange={e => setAdminFilters({...adminFilters, status: e.target.value})}>
                  <option value="all">Tất cả Trạng thái</option>
                  <option value="in-progress">Đang xử lý</option>
                  <option value="waiting-parts">Chờ linh kiện</option>
                  <option value="completed">Hoàn thành</option>
                </select>
                <select className="form-input" style={{ width: 'auto' }} value={adminFilters.priority} onChange={e => setAdminFilters({...adminFilters, priority: e.target.value})}>
                  <option value="all">Mọi Ưu tiên</option>
                  <option value="urgent">Khẩn cấp</option>
                  <option value="high">Cao</option>
                  <option value="medium">Trung bình</option>
                  <option value="low">Thấp</option>
                </select>
              </>
            )}
          </div>
        )}


        {role === 'admin' && showDashboard && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
              {/* Cột 1: Chỉ số tổng quát */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="stat-item" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tổng Ticket</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.total}</div>
                </div>
                <div className="stat-item" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border)' }}>
                  <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>Quá hạn SLA</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{stats.slaViolated}</div>
                </div>
                <div className="stat-item" style={{ gridColumn: 'span 2', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>Tỷ lệ hoàn thành</span>
                    <span style={{ fontWeight: 800, color: '#10b981' }}>{stats.total > 0 ? Math.round((stats.completed/stats.total)*100) : 0}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px' }}>
                    <div style={{ width: `${stats.total > 0 ? (stats.completed/stats.total)*100 : 0}%`, height: '100%', background: '#10b981', borderRadius: '4px', transition: 'width 1s ease-in-out' }}></div>
                  </div>
                </div>
              </div>

              {/* Cột 2: Biểu đồ cột Ưu tiên */}
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phân tích theo Ưu tiên</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                  <ChartBar value={stats.byPriority.urgent} max={stats.total} color="#ef4444" label="Khẩn" />
                  <ChartBar value={stats.byPriority.high} max={stats.total} color="#f97316" label="Cao" />
                  <ChartBar value={stats.byPriority.medium} max={stats.total} color="#eab308" label="Vừa" />
                  <ChartBar value={stats.byPriority.low} max={stats.total} color="#22c55e" label="Thấp" />
                </div>
              </div>

              {/* Cột 3: Biểu đồ cột Trạng thái */}
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phân tích theo Trạng thái</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '120px', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                  <ChartBar value={stats.byStatus.inProgress} max={stats.total} color="#3b82f6" label="Xử lý" />
                  <ChartBar value={stats.byStatus.waiting} max={stats.total} color="#f59e0b" label="Chờ linh kiện" />
                  <ChartBar value={stats.byStatus.completed} max={stats.total} color="#10b981" label="Xong" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className={activeTab === 'logs' ? '' : 'grid-view'} style={activeTab === 'logs' ? {width: '100%', maxWidth: '600px', margin: '0 auto'} : {}}>
          {activeTab === 'repair' ? (
            getFilteredRepairs().length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔧</div>
                <h3>Không tìm thấy kết quả</h3>
              </div>
            ) : (
              getFilteredRepairs().map((repair) => (
                <RepairCard key={repair.id} repair={repair} role={role} onClick={() => setSelectedRepair(repair)} onEdit={() => setEditingItem({ type: 'repair', data: repair })} />
              ))
            )
          ) : activeTab === 'policy' ? (
            policies.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())).map((policy) => (
                <PolicyCard 
                  key={policy.id} 
                  policy={policy} 
                  role={role}
                  onClick={() => setSelectedPolicy(policy)} 
                  onEdit={() => setEditingItem({ type: 'policy', data: policy })} 
                />
            ))

          ) : activeTab === 'users' ? (
            <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                   <h2 style={{ marginBottom: '0.2rem' }}>Quản lý Tài khoản Hệ thống</h2>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Phân quyền và quản lý truy cập cho nhân viên IT & Staff</p>
                </div>
                <button className="tab-btn active" onClick={() => setEditingItem({ 
                  type: 'user', 
                  isNew: true, 
                  data: { id: 'U'+Date.now(), username: '', password: '', fullName: '', email: '', role: 'staff', status: 'approved', createdAt: new Date().toISOString().split('T')[0] } 
                })}>
                  <Plus size={18} /> Thêm tài khoản mới
                </button>
              </div>

              <div style={{ background: 'var(--bg-card)', borderRadius: '15px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '1.2rem' }}>Họ và Tên</th>
                      <th style={{ padding: '1.2rem' }}>Tên đăng nhập</th>
                      <th style={{ padding: '1.2rem' }}>Email / Vai trò</th>
                      <th style={{ padding: '1.2rem' }}>Trạng thái</th>
                      <th style={{ padding: '1.2rem', textAlign: 'right' }}>Thao tác</th>

                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr 
                        key={user.id} 
                        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
                        onClick={() => setEditingItem({ type: 'user', data: user })}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-main)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >

                        <td style={{ padding: '1.2rem' }}>
                          <div style={{ fontWeight: 600 }}>{user.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {user.id}</div>
                        </td>
                        <td style={{ padding: '1.2rem' }}>
                          <div style={{ fontWeight: 600 }}>{user.email}</div>
                          <span style={{ 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '20px', 
                            fontSize: '0.7rem', 
                            fontWeight: 700,
                            background: user.role === 'admin' ? '#fee2e2' : '#dcfce7',
                            color: user.role === 'admin' ? '#991b1b' : '#166534'
                          }}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '1.2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: user.status === 'approved' ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.9rem' }}>
                            {user.status === 'approved' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                            {user.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </div>
                        </td>
                        <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="tab-btn" style={{ padding: '0.4rem' }} onClick={() => setEditingItem({ type: 'user', data: user })}>
                              <Edit2 size={14} /> Xem & Sửa
                            </button>
                            <button className="tab-btn" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => {
                              if(user.username === 'admin') return alert('Không thể xóa tài khoản Admin gốc!');
                              if(confirm(`Xóa tài khoản ${user.username}?`)) {
                                setUsers(users.filter(u => u.id !== user.id));
                                addLog(`[Admin] Đã xóa tài khoản: ${user.username}`);
                              }
                            }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {logs.map(log => (
                  <div key={log.id} style={{ padding: '1rem 1.5rem', background: 'var(--bg-card)', borderRadius: '12px', borderLeft: log.msg.includes('xóa') ? '4px solid var(--danger)' : '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}><Clock size={14} /> {log.time}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{log.msg}</div>
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRepair && (
          <DetailModal onClose={() => setSelectedRepair(null)}>
            <RepairDetail repair={selectedRepair} />
          </DetailModal>
        )}
        {selectedPolicy && (
          <DetailModal onClose={() => setSelectedPolicy(null)}>
            <PolicyDetail policy={selectedPolicy} onAttachmentClick={() => {}} />
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
                setEditingItem(null);
              }} onCancel={() => setEditingItem(null)} />
            ) : editingItem.type === 'user' ? (
              <UserEditForm data={editingItem.data} isNew={editingItem.isNew} onSave={(u) => {
                if (editingItem.isNew) {
                  setUsers([...users, u]);
                  addLog(`[Admin] Đã tạo tài khoản mới: ${u.fullName} (${u.username})`);
                } else {
                  setUsers(users.map(old => old.id === u.id ? u : old));
                  addLog(`[Admin] Đã cập nhật tài khoản: ${u.username}`);
                }
                setEditingItem(null);
              }} onCancel={() => setEditingItem(null)} />
            ) : (
              <PolicyEditForm data={editingItem.data} isNew={editingItem.isNew} role={role} onSave={(item) => {
                handleSavePolicy(item);
                setEditingItem(null);
              }} onCancel={() => setEditingItem(null)} />
            )}
          </DetailModal>
        )}
      </AnimatePresence>
      </div>
    </div>
  );

}

// Component hiển thị thẻ Lịch sử sửa chữa (Card)
function RepairCard({ repair, onClick, onEdit, role }: { repair: RepairHistory, onClick: () => void, onEdit: () => void, role: string }) {
  const statusInfo = {
    'completed': { icon: <CheckCircle2 size={16} />, color: '#10b981', label: 'Hoàn thành' },
    'in-progress': { icon: <Clock size={16} />, color: '#3b82f6', label: 'Đang xử lý' },
    'waiting-parts': { icon: <AlertCircle size={16} />, color: '#f59e0b', label: 'Chờ linh kiện' },
    'cancelled': { icon: <X size={16} />, color: '#ef4444', label: 'Đã hủy' }
  }[repair.status] || { icon: <Activity size={16} />, color: '#3b82f6', label: 'Đang xử lý' };

  const priorityConfigs: Record<string, { color: string, label: string }> = {
    'urgent': { color: '#ef4444', label: 'Khẩn cấp' },
    'high': { color: '#f97316', label: 'Cao' },
    'medium': { color: '#eab308', label: 'Trung bình' },
    'low': { color: '#22c55e', label: 'Thấp' }
  };
  const pInfo = priorityConfigs[repair.priority || 'medium'] || priorityConfigs['medium'];


  const isSlaViolated = repair.status !== 'completed' && (repair as any).deadline && new Date((repair as any).deadline) < new Date();

  return (
    <motion.div className="card" whileHover={{ y: -5 }} onClick={onClick} style={{ borderLeft: `5px solid ${pInfo.color}`, cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.3rem', fontSize: '1.1rem' }}>{repair.machineName || 'Chưa đặt tên'}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{repair.machineId}</span>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: pInfo.color + '20', color: pInfo.color, fontWeight: 700 }}>{pInfo.label.toUpperCase()}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: statusInfo.color, fontSize: '0.85rem', fontWeight: 600 }}>
          {statusInfo.icon} {statusInfo.label}
        </div>
      </div>
      
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Lỗi: </span>
        {repair.problem && repair.problem.length > 80 ? repair.problem.substring(0, 80) + '...' : repair.problem || 'Chưa mô tả lỗi'}
      </p>

      {repair.assetId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
          <Briefcase size={14} /> <span>Tài sản: {repair.assetId}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={14} /> <span>{repair.repairDate}</span>
        </div>
        <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{repair.cost.toLocaleString()} đ</div>
      </div>

      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
            {repair.repairedBy ? repair.repairedBy.split(' ').pop()?.charAt(0) : '?'}
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{repair.repairedBy || 'Chưa phân công'}</span>
        </div>
        
        {isSlaViolated && (
          <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={14} /> QUÁ HẠN SLA
          </div>
        )}
      </div>

      {role === 'admin' && (
        <button className="edit-btn" style={{ position: 'absolute', top: '-10px', right: '-10px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }} 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <Edit2 size={14} />
        </button>
      )}
    </motion.div>
  );
}


// Component hiển thị thẻ Chính sách nội quy (Thumbnail Policy)
function PolicyCard({ policy, onClick, onEdit, role }: { policy: Policy, onClick: () => void, onEdit: () => void, role: string }) {
  return (
    <motion.div className="card" whileHover={{ y: -5 }} onClick={onClick} style={{ cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>{policy.category}</div>
        <div className={`badge badge-${policy.status}`}>{policy.status === 'active' ? 'ĐANG ÁP DỤNG' : 'BẢN NHÁP'}</div>
      </div>
      <div className="card-title" style={{ marginBottom: '1rem', flex: 1 }}>{policy.title || 'Chính sách không tiêu đề'}</div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <span>Tạo bởi: {policy.createdBy}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 700 }}>Xem chi tiết <ChevronRight size={14} /></div>
        </div>
      </div>

      {role === 'admin' && (
        <button className="edit-btn" style={{ position: 'absolute', top: '-10px', right: '-10px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }} 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <Edit2 size={14} />
        </button>
      )}
    </motion.div>
  );
}


// =========================================================
// 5. COMPONENT XEM CHI TIẾT (POPUP MODAL)
// =========================================================

// Đây là các view chi tiết (Chỉ xem) (Read-only view)
// =========================================================

// Khung hiển thị Chi tiết một Lịch sử sửa chữa
function RepairDetail({ repair }: { repair: RepairHistory }) {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>{repair.machineName}</h2>
      <div className="grid-2-cols" style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
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

// Khung hiển thị Chi tiết của một quyển Chính sách
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

// =========================================================
// 6. COMPONENT NHẬP LIỆU (CÁC FORM ĐIỀN THÔNG TIN)
// Cho phép Admin lưu trữ hoặc cho Nhân viên tạo Yêu cầu
// =========================================================

// Biểu mẫu Nhập liệu Chính sách Công ty
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

// =========================================================
// 7. COMPONENT TIỆN ÍCH (UTILITIES UI)
// Các wrapper dùng chung (Modal, Hiển thị nhãn...)
// =========================================================

// Khung Modal trong suốt đè lên màn hình
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

// Cấu trúc hiển thị 1 mục nhỏ [Tiêu đề - Giá trị]
function DetailItem({ label, value, valueStyle }: { label: string, value: string, valueStyle?: any }) {
  return (
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontWeight: 600, ...valueStyle }}>{value}</div>
    </div>
  );
}

// Vỏ bọc Input có thêm Title cho các Form
function FormComp({ label, children, fullW }: { label: string, children: React.ReactNode, fullW?: boolean }) {
  return (
    <div style={{ gridColumn: fullW ? '1 / span 2' : 'auto' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>{label}</label>
      {children}
    </div>
  );
}

// Biểu mẫu Nhập liệu Lịch sử (Dùng chung cho Tạo mới & Chỉnh sửa tùy theo Role)
function RepairEditForm({ data, isNew, role, onSave, onCancel }: { data: RepairHistory, isNew?: boolean, role?: string, onSave: (d: RepairHistory) => void, onCancel: () => void }) {
  const [f, setF] = useState({ ...data, priority: (data as any).priority || 'medium' });
  const [showQRScanner, setShowQRScanner] = useState(false);

  const quickDevices = [
    { id: 'IT-LAP-001', name: 'Dell Latitude 5420', type: 'Laptop' },
    { id: 'IT-DES-002', name: 'PC Desktop Core i7', type: 'Workstation' },
    { id: 'IT-PRI-003', name: 'HP LaserJet Pro M404n', type: 'Printer' },
    { id: 'IT-NET-004', name: 'Cisco Router 2911', type: 'Network' },
    { id: 'IT-LAP-005', name: 'Macbook Pro M1', type: 'Laptop' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>{role === 'staff' ? '📝 Lập phiếu yêu cầu' : isNew ? '✨ Thêm lịch sử mới' : '📝 Sửa lịch sử'}</h2>

      {role === 'staff' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="qr-box" onClick={() => setShowQRScanner(!showQRScanner)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
            <QrCode size={32} color="var(--primary)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Quét mã QR thiết bị</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bấm để chọn nhanh thông tin máy — không cần nhập tay</span>
            </div>
          </div>
          <AnimatePresence>
            {showQRScanner && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: '0.5rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {quickDevices.map(dev => (
                  <div key={dev.id} onClick={() => { setF({...f, machineId: dev.id, machineName: dev.name }); setShowQRScanner(false); }}
                    style={{ padding: '0.8rem 1.2rem', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{dev.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dev.id} — {dev.type}</div>
                    </div>
                    <div style={{ padding: '4px', background: 'white', borderRadius: '6px', flexShrink: 0 }}>
                      <QRCodeSVG value={`DEVICE:${dev.id}:${dev.name}`} size={48} bgColor="#ffffff" fgColor="#0f172a" level="M" />
                    </div>
                    <ChevronRight size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="grid-2-cols" style={{ display: 'grid', gap: '1rem' }}>
        <FormComp label="Tên thiết bị"><input className="form-input" value={f.machineName} onChange={e => setF({...f, machineName: e.target.value})} placeholder="VD: Máy cắt CNC" /></FormComp>
        <FormComp label="Mã thiết bị"><input className="form-input" value={f.machineId} onChange={e => setF({...f, machineId: e.target.value})} /></FormComp>
        
        {role === 'admin' && (
          <>
            <FormComp label="Gắn tài sản IT">
              <select className="form-input" value={f.assetId || ''} onChange={e => setF({...f, assetId: e.target.value})}>
                <option value="">-- Chọn tài sản liên kết --</option>
                {mockAssets.map(a => <option key={a.id} value={a.id}>{a.id} - {a.name}</option>)}
              </select>
            </FormComp>
            
            <FormComp label="Phân công Kỹ thuật">
              <select className="form-input" value={f.repairedBy} onChange={e => setF({...f, repairedBy: e.target.value})}>
                <option value="">-- Chưa phân công --</option>
                {mockTechnicians.map(t => <option key={t.id} value={t.name}>{t.name} ({t.role})</option>)}
              </select>
            </FormComp>
          </>
        )}

        <FormComp label="Ngày báo lỗi"><input className="form-input" type="date" value={f.repairDate} onChange={e => setF({...f, repairDate: e.target.value})} /></FormComp>
        
        {role === 'admin' && (
          <>
            <FormComp label="Hạn xử lý (SLA)"><input className="form-input" type="date" value={f.deadline} onChange={e => setF({...f, deadline: e.target.value})} /></FormComp>
            <FormComp label="Trạng thái">
              <select className="form-input" value={f.status} onChange={e => setF({...f, status: e.target.value as any})}>
                <option value="in-progress">Đang xử lý</option>
                <option value="waiting-parts">Chờ linh kiện</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </FormComp>
            <FormComp label="Mức độ ưu tiên">
              <select className="form-input" value={f.priority} onChange={e => setF({...f, priority: e.target.value as any})}>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </FormComp>
            <FormComp label="Dự kiến chi phí (nếu có)"><input className="form-input" type="number" value={f.cost} onChange={e => setF({...f, cost: Number(e.target.value)})} /></FormComp>
          </>
        )}

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



// Biểu mẫu Quản lý Tài khoản (Chỉ Admin)
function UserEditForm({ data, isNew, onSave, onCancel }: { data: UserAccount, isNew?: boolean, onSave: (u: UserAccount) => void, onCancel: () => void }) {
  const [f, setF] = useState({ ...data });

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>{isNew ? '✨ Tạo tài khoản mới' : '📝 Chỉnh sửa tài khoản'}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <FormComp label="Họ và Tên">
          <input className="form-input" value={f.fullName} onChange={e => setF({...f, fullName: e.target.value})} placeholder="VD: Nguyễn Văn A" />
        </FormComp>
        <FormComp label="Tên đăng nhập">
          <input className="form-input" value={f.username} onChange={e => setF({...f, username: e.target.value})} placeholder="VD: nv02" disabled={!isNew} />
        </FormComp>
        <FormComp label="Mật khẩu">
          <input className="form-input" type="text" value={f.password} onChange={e => setF({...f, password: e.target.value})} placeholder="Nhập mật khẩu" />
        </FormComp>
        <FormComp label="Email">
          <input className="form-input" value={f.email} onChange={e => setF({...f, email: e.target.value})} placeholder="email@rmg.vn" />
        </FormComp>
        <FormComp label="Vai trò (Role)">
          <select className="form-input" value={f.role} onChange={e => setF({...f, role: e.target.value as any})}>
            <option value="staff">Nhân viên (Staff)</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        </FormComp>
        <FormComp label="Trạng thái">
          <select className="form-input" value={f.status} onChange={e => setF({...f, status: e.target.value as any})}>
            <option value="approved">Đã phê duyệt (Approved)</option>
            <option value="pending">Chờ phê duyệt (Pending)</option>
          </select>
        </FormComp>

      </div>
      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button className="tab-btn" onClick={onCancel}>Hủy bỏ</button>
        {f.status === 'pending' && (
          <button className="tab-btn" style={{ background: '#10b981', color: 'white' }} onClick={() => {
            const updated = { ...f, status: 'approved' as const };
            onSave(updated);
            alert('Đã phê duyệt tài khoản thành công!');
          }}>
            ✅ Phê duyệt tài khoản
          </button>
        )}
        <button className="tab-btn active" onClick={() => {
          if(!f.username || !f.password || !f.fullName) return alert('Vui lòng nhập đủ thông tin!');
          onSave(f);
        }}>Lưu thông tin</button>
      </div>

    </div>
  );
}

export default App;
