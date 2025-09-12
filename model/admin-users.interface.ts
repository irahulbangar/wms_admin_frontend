export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: AdminUsers[];
}

export interface AdminUsers {
  admin_id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  contact_number: string;
  status: string;
  location: string;
  department: string;
  created_at: string;
  updated_at: string;
}
