export interface DeviceTypeResponse {
  success: boolean;
  message: string;
  data: DeviceTypeResult[];
}

export interface DeviceTypeResult {
  id: number;
  devicefid: number;
  topics: string;
  created_at: string;
  updated_at: string;
}
