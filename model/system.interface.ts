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
  department_name: string;
  organization_name: string;
  plant_name: string;
  created_at: string;
  updated_at: string;
  status: string;
  is_deleted: boolean;
  system_reporting: SystemReporting | null;
}

export interface SystemReporting {
  report_name: string;
  report_unit: string;
  report_formula: string;
  neutrality_formula: string;
}
