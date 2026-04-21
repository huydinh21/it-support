export interface Policy {
  id: string;
  title: string;
  category: 'hr' | 'it' | 'safety' | 'finance' | 'general';
  status: 'active' | 'expired' | 'draft';
  issuedDate: string;
  effectiveDate: string;
  expiryDate?: string;
  content: string;
  attachments?: Array<{ name: string; url: string; type: string; }>;
  createdBy: string;
  lastUpdated?: string;
}

export const mockPolicies: Policy[] = [
  {
    id: 'POL001',
    title: 'Nội quy an toàn lao động tại xưởng',
    category: 'safety',
    status: 'active',
    issuedDate: '2024-01-01',
    effectiveDate: '2024-01-01',
    content: `
      <h2>Nội quy an toàn lao động</h2>
      <h3>1. Quy định về bảo hộ</h3>
      <ul>
        <li>Tất cả nhân viên phải mặc đồng phục bảo hộ khi vào xưởng.</li>
        <li>Đeo kính bảo hộ và găng tay khi vận hành máy cắt.</li>
        <li>Giày bảo hộ phải có mũi thép chống va đập.</li>
      </ul>
      <h3>2. Quy trình khẩn cấp</h3>
      <p>Trong trường hợp xảy ra sự cố, nhấn nút dừng khẩn cấp (Emergency Stop) ngay lập tức và báo cáo cho quản lý trực tiếp.</p>
    `,
    attachments: [
      { name: 'Huong_dan_an_toan.pdf', url: '/docs/safety_guide.pdf', type: 'PDF' }
    ],
    createdBy: 'Phòng HSE',
    lastUpdated: '2024-01-01'
  },
  {
    id: 'POL002',
    title: 'Quy định sử dụng máy tính và internet',
    category: 'it',
    status: 'active',
    issuedDate: '2024-01-15',
    effectiveDate: '2024-01-15',
    content: `
      <h2>Quy định sử dụng máy tính và internet</h2>
      <h3>1. Sử dụng máy tính</h3>
      <ul>
        <li>Máy tính công ty chỉ được sử dụng cho mục đích công việc.</li>
        <li>Không được cài đặt phần mềm không được phép.</li>
        <li>Đăng xuất khỏi hệ thống khi kết thúc ca làm việc.</li>
      </ul>
      <h3>2. Bảo mật thông tin</h3>
      <p>Không chia sẻ mật khẩu truy cập hệ thống quản lý tài sản cho người không có thẩm quyền.</p>
    `,
    createdBy: 'Phòng IT',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'POL003',
    title: 'Chính sách khen thưởng sáng kiến kỹ thuật',
    category: 'hr',
    status: 'active',
    issuedDate: '2024-02-10',
    effectiveDate: '2024-02-15',
    content: `
      <h2>Chính sách khuyến khích sáng kiến</h2>
      <p>Công ty luôn khuyến khích nhân viên đóng góp các giải pháp cải tiến quy trình vận hành và bảo trì máy móc.</p>
      <h3>Mức thưởng:</h3>
      <ul>
        <li>Sáng kiến loại A: 5.000.000 VNĐ</li>
        <li>Sáng kiến loại B: 3.000.000 VNĐ</li>
        <li>Sáng kiến loại C: 1.000.000 VNĐ</li>
      </ul>
    `,
    createdBy: 'Phòng Nhân sự',
    lastUpdated: '2024-02-10'
  },
  {
    id: 'POL004',
    title: 'Quy trình bảo trì định kỳ thiết bị',
    category: 'general',
    status: 'draft',
    issuedDate: '2024-03-01',
    effectiveDate: '2024-04-01',
    content: `
      <h2>Quy trình bảo trì định kỳ</h2>
      <p>Nội dung đang được soạn thảo và lấy ý kiến từ các tổ trưởng sản xuất.</p>
    `,
    createdBy: 'Phòng Kỹ thuật',
    lastUpdated: '2024-03-15'
  },
  {
    id: 'POL005',
    title: 'Quy định về thời gian làm việc và nghỉ ngơi',
    category: 'hr',
    status: 'active',
    issuedDate: '2023-12-20',
    effectiveDate: '2024-01-01',
    content: `
      <h2>Quy định thời gian làm việc</h2>
      <ul>
        <li>Ca sáng: 08:00 - 12:00</li>
        <li>Nghỉ trưa: 12:00 - 13:00</li>
        <li>Ca chiều: 13:00 - 17:00</li>
      </ul>
    `,
    createdBy: 'Ban Giám đốc',
    lastUpdated: '2023-12-20'
  }
];
