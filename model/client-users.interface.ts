export interface ClientUsersResponse {
  success: boolean;
  message: string;
  data: ClientUsersResult[];
  status: number;
}

export interface ClientUsersResult {
  client_id: number;
  client_name: string;
  client_email: string;
  client_password: string;
  client_phone: string;
  status: string;
  organization_id: number;
  created_at: string;
  updated_at: string;
  organization_name: string;
}
