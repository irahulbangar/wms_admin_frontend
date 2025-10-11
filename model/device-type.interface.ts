export interface DeviceTypeResponse {
  success: boolean;
  message: string;
  data: DeviceTypeResult[];
  status: number;
}

export interface DeviceTypeResult {
  device_type_id: number;
  device_type_name: string;
  topic: string;
  created_at: string;
  updated_at: string;
  device_family_id: number;
}
