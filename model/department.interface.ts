export interface DepartmentResponse {
  success: boolean;
  message: string;
  data: DepartmentResult[];
}

export interface DepartmentResult {
  department_id: number;
  department_name: string;
  department_info: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}
