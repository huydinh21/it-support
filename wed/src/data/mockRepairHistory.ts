export interface RepairHistory {
  id: string;
  machineId: string;
  machineName: string;
  machineType: string;
  repairDate: string;
  repairedBy: string;
  problem: string;
  solution: string;
  cost: number;
  status: 'completed' | 'in-progress' | 'waiting-parts';
  partsReplaced: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

export const mockRepairHistory: RepairHistory[] = [
  {
    id: 'RH001',
    machineId: 'M001',
    machineName: 'Máy ép nhựa số 1',
    machineType: 'Máy ép nhựa',
    repairDate: '2024-01-15',
    repairedBy: 'Nguyễn Văn A',
    problem: 'Máy không ép được, có tiếng kêu lạ',
    solution: 'Thay thế bộ phận ép, bôi trơn lại hệ thống',
    cost: 2500000,
    status: 'completed',
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
    repairDate: '2024-01-20',
    repairedBy: 'Trần Văn B',
    problem: 'Lỗi bộ điều khiển trung tâm',
    solution: 'Thay thế module điều khiển, nạp lại firmware',
    cost: 4800000,
    status: 'completed',
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
    repairDate: '2024-02-01',
    repairedBy: 'Lê Văn C',
    problem: 'Hệ thống cảm biến bị lỗi',
    solution: 'Đang chờ phụ tùng thay thế',
    cost: 0,
    status: 'waiting-parts',
    partsReplaced: [],
    notes: 'Đã đặt hàng cảm biến, dự kiến về trong 3 ngày'
  },
  {
    id: 'RH004',
    machineId: 'M004',
    machineName: 'Máy phát điện dự phòng',
    machineType: 'Máy phát điện',
    repairDate: '2024-02-10',
    repairedBy: 'Phạm Văn D',
    problem: 'Rò rỉ dầu máy',
    solution: 'Đang kiểm tra các đầu nối ống dẫn',
    cost: 500000,
    status: 'in-progress',
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
    repairDate: '2024-03-05',
    repairedBy: 'Nguyễn Văn A',
    problem: 'Khớp nối số 3 bị kẹt',
    solution: 'Vệ sinh, tra mỡ chịu nhiệt chuyên dụng',
    cost: 1200000,
    status: 'completed',
    partsReplaced: [
      { name: 'Mỡ chịu nhiệt', quantity: 1, unitPrice: 800000 },
      { name: 'Vòng đệm', quantity: 4, unitPrice: 100000 }
    ],
    notes: 'Vận hành trơn tru, không còn tiếng kêu'
  }
];
