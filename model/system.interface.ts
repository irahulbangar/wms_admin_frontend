export interface SystemResponse {
  success: boolean;
  message: string;
  data: SystemResult[];
  status: number;
}

export interface SystemResult {
  system_id: number;
  system_name: string;
  system_info: string;
  plant_id: number;
  organization_id: number;
  department_id: number;
}
