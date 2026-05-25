// =========================================================
// MÔ HÌNH DỮ LIỆU: LỊCH SỬ SỬA CHỮA (REPAIR HISTORY)
// Chứa định nghĩa kiểu dữ liệu (Interface) và dữ liệu mẫu ảo (Mock Data)
// =========================================================

// Định nghĩa cấu trúc của một bản ghi Lịch sử sửa chữa
export interface RepairHistory {
  id: string; // Mã định danh duy nhất của phiếu sửa chữa
  machineId: string; // Mã số của thiết bị/máy móc
  machineName: string; // Tên hiển thị của máy
  machineType: string; // Chủng loại máy (vd: Máy in, Máy lạnh...)
  repairDate: string; // Ngày thực hiện sửa chữa (Định dạng YYYY-MM-DD)
  repairedBy: string; // Kỹ thuật viên phụ trách sửa chữa (Assignee)
  problem: string; // Mô tả chi tiết vấn đề/lỗi máy gặp phải
  solution: string; // Cách giải quyết/Khắc phục của kỹ thuật
  cost: number; // Tổng chi phí sửa chữa (VNĐ)
  status: 'completed' | 'in-progress' | 'waiting-parts' | 'cancelled'; // Trạng thái
  priority: 'low' | 'medium' | 'high' | 'urgent'; // Mức độ ưu tiên (SLA)
  deadline: string; // Hạn chót xử lý (SLA Deadline)
  assetId?: string; // Liên kết với mã tài sản IT cụ thể
  partsReplaced: Array<{
    name: string; // Tên linh kiện thay thế
    quantity: number; // Số lượng
    unitPrice: number; // Đơn giá
  }>;
  notes?: string; // Ghi chú thêm (Không bắt buộc)
}

// Danh sách kỹ thuật viên (Technicians) - Cập nhật từ Database Nhân sự thực tế
export const mockTechnicians = [
  { id: 'TECH001', name: 'Lê Văn Chiến', role: 'Kỹ thuật viên (TEC)' },
  { id: 'TECH002', name: 'Nguyễn Văn Hải', role: 'Kỹ thuật viên (TEC)' },
  { id: 'TECH003', name: 'Trần Văn Tài', role: 'Kỹ thuật viên (TEC)' },
  { id: 'TECH004', name: 'Huỳnh Thanh Tâm', role: 'Kỹ thuật viên (TEC)' },
  { id: 'TECH005', name: 'Lê Trọng Sang', role: 'Kỹ thuật viên (TEC)' },
  { id: 'TECH006', name: 'Phạm Văn Đông', role: 'Kỹ thuật viên (TEC)' },
  { id: 'TECH007', name: 'Võ Hoàng Anh', role: 'Kỹ thuật viên (TEC)' },
  { id: 'TECH008', name: 'Nguyễn Văn Trung', role: 'Kỹ thuật viên (TEC)' },
  { id: 'TECH009', name: 'Đinh Quang Huy IT', role: 'Kỹ thuật viên (IT)' },
];


// Danh sách tài sản IT (Assets) để liên kết - Cập nhật từ Database thực tế
export const mockAssets = [
  { id: 'IT-LAP-001', name: 'Dell Latitude 5420 - HR Dept', type: 'Laptop' },
  { id: 'IT-DES-002', name: 'PC Desktop i7 - TEC Dept', type: 'Workstation' },
  { id: 'IT-PRI-003', name: 'HP LaserJet M404n - Accounting', type: 'Printer' },
  { id: 'IT-NET-004', name: 'Cisco Router 2911 - Server Room', type: 'Network' },
  { id: 'IT-LAP-005', name: 'Macbook Pro M1 - Design Team', type: 'Laptop' },
  { id: 'IT-MON-006: ', name: 'Dell UltraSharp 24 - Director Room', type: 'Monitor' },
  { id: 'IT-UPS-007', name: 'APC Smart-UPS 1500VA', type: 'Power' },
];

// Khởi tạo danh sách Dữ liệu mẫu (Mock data) ban đầu cho Lịch sử
export const mockRepairHistory: RepairHistory[] = [
  {
    id: 'RH001',
    machineId: 'M001',
    machineName: 'Máy ép nhựa số 1',
    machineType: 'Máy ép nhựa',
    repairDate: '2024-05-01',
    repairedBy: 'Nguyễn Văn A',
    problem: 'Máy không ép được, có tiếng kêu lạ',
    solution: 'Thay thế bộ phận ép, bôi trơn lại hệ thống',
    cost: 2500000,
    status: 'completed',
    priority: 'high',
    deadline: '2024-05-02',
    assetId: 'ASSET-001',
    partsReplaced: [
      { name: 'Bộ phận ép', quantity: 1, unitPrice: 2000000 },
      { name: 'Dầu bôi trơn', quantity: 2, unitPrice: 250000 }
    ],
    notes: 'Máy hoạt động bình thường sau khi sửa'
  },
  {
    id: 'RH002',
    machineId: 'M002',
    machineName: 'Máy cắt CNC-02',
    machineType: 'Máy cắt CNC',
    repairDate: '2024-05-05',
    repairedBy: 'Trần Văn B',
    problem: 'Lỗi bộ điều khiển trung tâm',
    solution: 'Thay thế module điều khiển, nạp lại firmware',
    cost: 4800000,
    status: 'completed',
    priority: 'urgent',
    deadline: '2024-05-05',
    assetId: 'ASSET-003',
    partsReplaced: [
      { name: 'Module điều khiển CNC', quantity: 1, unitPrice: 4500000 },
      { name: 'Cáp tín hiệu', quantity: 3, unitPrice: 100000 }
    ],
    notes: 'Đã kiểm tra độ chính xác sau khi sửa'
  },
  {
    id: 'RH003',
    machineId: 'M003',
    machineName: 'Máy đóng gói tự động',
    machineType: 'Máy đóng gói',
    repairDate: '2024-05-08',
    repairedBy: 'Lê Văn C',
    problem: 'Hệ thống cảm biến bị lỗi',
    solution: 'Đang chờ phụ tùng thay thế',
    cost: 0,
    status: 'waiting-parts',
    priority: 'medium',
    deadline: '2024-05-12',
    assetId: 'ASSET-002',
    partsReplaced: [],
    notes: 'Đã đặt hàng cảm biến, dự kiến về trong 3 ngày'
  },
  {
    id: 'RH004',
    machineId: 'M004',
    machineName: 'Máy phát điện dự phòng',
    machineType: 'Máy phát điện',
    repairDate: '2024-05-10',
    repairedBy: 'Phạm Văn D',
    problem: 'Rò rỉ dầu máy',
    solution: 'Đang kiểm tra các đầu nối ống dẫn',
    cost: 500000,
    status: 'in-progress',
    priority: 'high',
    deadline: '2024-05-11',
    assetId: 'ASSET-005',
    partsReplaced: [
      { name: 'Ron cao su', quantity: 2, unitPrice: 150000 }
    ],
    notes: 'Cần theo dõi thêm trong 24h'
  },
  {
    id: 'RH005',
    machineId: 'M005',
    machineName: 'Cánh tay robot Kuka',
    machineType: 'Robot công nghiệp',
    repairDate: '2024-05-11',
    repairedBy: 'Nguyễn Văn A',
    problem: 'Khớp nối số 3 bị kẹt',
    solution: 'Vệ sinh, tra mỡ chịu nhiệt chuyên dụng',
    cost: 1200000,
    status: 'completed',
    priority: 'low',
    deadline: '2024-05-15',
    assetId: 'ASSET-004',
    partsReplaced: [
      { name: 'Mỡ chịu nhiệt', quantity: 1, unitPrice: 800000 },
      { name: 'Vòng đệm', quantity: 4, unitPrice: 100000 }
    ],
    notes: 'Vận hành trơn tru, không còn tiếng kêu'
  }
];

