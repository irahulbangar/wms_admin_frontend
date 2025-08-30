export interface DeviceFamilyResponse {
  success: boolean;
  message: string;
  data: DeviceFamilyResult[];
}

export interface DeviceFamilyResult {
  device_family_id: number;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
}
