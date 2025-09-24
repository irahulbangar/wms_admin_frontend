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
  visibility: string;
  is_deleted: boolean;
  department_connection: string;
  organization_id?: number;
  project_connection: string;
  organization_connection: string;
  device_family: string;
  name: string;
  type: string;
  device_type: string;
  device_type_name: string;
  department_name: string;
  project_name: string;
  latitude: string;
  longitude: string;
  address: string;
}

export interface LastRecord {
  avg?: number;
  max?: number;
  min?: number;
  flow?: number;
  time: string;
  hrs_avg?: number;
  hrs_max?: number;
  hrs_min?: number;
  min_avg?: number;
  min_max?: number;
  min_min?: number;
  hrs_flow?: number;
  min_flow?: number;
  max_level?: number;
  min_level?: number;
  last_level?: string;
  first_level?: string;
  day_max_level?: number;
  day_min_level?: number;
  hrs_max_level?: number;
  hrs_min_level?: number;
  min_max_level?: number;
  min_min_level?: number;
  day_last_level?: number;
  hrs_last_level?: number;
  min_last_level?: string;
  day_first_level?: number;
  hrs_first_level?: number;
  min_first_level?: string;
  day_avg?: number;
  day_max?: number;
  day_min?: number;
  day_flow?: number;
  max_height?: number
  min_height?: number
  last_height?: number
  first_height?: number
}

export interface Params {
  shifter?: number;
  height?: number;
  multiplier?: number;
  sensorPostion?: number;
  storageCapacity?: number;
  maxLpmLimit?: number;
}
