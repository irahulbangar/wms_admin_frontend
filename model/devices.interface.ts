export interface DeviceResponse {
  success: boolean;
  message: string;
  data: DeviceResult[];
}

export interface DeviceResult {
  device_id: number;
  project_id: number;
  device_family_id: number;
  device_type_id: number;
  hwid: string;
  device_name: string;
  device_status: string;
  department_id: number;
  created_at: string;
  updated_at: string;
  device_family: string;
  device_type: string;
  department_name: string;
  project_name: string;
}
