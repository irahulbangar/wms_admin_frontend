export interface SingleAdminResponse {
  success: boolean;
  message: string;
  data: SingleAdminResult;
}

export interface SingleAdminResult {
  admin_id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  contact_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  location: string;
  department: string;
}
