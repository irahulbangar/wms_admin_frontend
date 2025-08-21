export interface DeviceFamilyResponse {
  success: boolean;
  message: string;
  data: DeviceFamilyResult[];
}

export interface DeviceFamilyResult {
  id: number;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
  devicefamilyid: number;
}
