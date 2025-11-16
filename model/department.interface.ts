export interface DepartmentResponse {
  success: boolean;
  message: string;
  data: DepartmentResult[];
  status: number;
}

export interface DepartmentResult {
  department_id: number;
  department_name: string;
  department_info: string;
  organization_id: number;
  plant_id: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  organization_name: string;
  plant_name: string;
  department_reporting: DepartmentReporting | null;
}

export interface DepartmentReporting {
  report_name: string;
  report_unit: string;
  report_formula: string;
  neutrality_formula: string;
}
