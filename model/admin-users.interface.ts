export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: AdminUsers[];
}

export interface AdminUsers {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  contact_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}
