export interface DeviceResponse {
  success: boolean;
  message: string;
  data: DeviceResult[];
}

export interface DeviceResult {
  device_id: number;
  project_id: number;
  device_name: string;
  device_status: string;
  created_at: string;
  updated_at: string;
  devicetypeid: number;
  imeino: string;
  devicefid: number;
  department_id: number;
  device_type: string;
  device_family: string;
}
