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
  }
];

