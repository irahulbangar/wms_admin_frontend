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
  last_record_time: string;
  last_record: LastRecord;
  params: Params;
  name: string;
  device_type_name: string;
  department_name: string;
  project_name: string;
  latitude: string;
  longitude: string;
  address: string;
}

export interface LastRecord {
  hrs_max?: number;
  hrs_min?: number;
  min_avg?: number;
  min_max?: number;
  min_min?: number;
  min_flow?: number;
  day_max_level?: number;
  day_min_level?: number;
  hrs_max_level?: number;
  hrs_min_level?: number;
  min_max_level?: number;
  min_min_level?: number;
  day_last_level?: number;
  hrs_last_level?: number;
  min_last_level?: string;
  hrs_first_level?: number;
  min_first_level?: string;
}

export interface Params {
  height?: number;
  shifter?: number;
  multiplier?: number;
  sensorPostion?: number;
  storageCapacity?: number;
}
