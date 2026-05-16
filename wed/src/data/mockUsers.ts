export interface UserAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: 'admin' | 'staff';
  status: 'approved' | 'pending';
  createdAt: string;
}

export const mockUsers: UserAccount[] = [
  {
    id: 'U001',
    username: 'admin',
    password: 'admin@123',
    fullName: 'Quản trị viên Hệ thống',
    email: 'admin@rmg.vn',
    role: 'admin',
    status: 'approved',
    createdAt: '2024-01-01'
  },
  {
    id: 'U002',
    username: 'nv01',
    password: '123456',
    fullName: 'Nhân viên Kỹ thuật 01',
    email: 'nv01@rmg.vn',
    role: 'staff',
    status: 'approved',
    createdAt: '2024-01-05'
  }
];

