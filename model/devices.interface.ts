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
  time?: string
  max_level?: number
  min_level?: number
  last_level?: string
  first_level?: string
  avg?: number
  max?: number
  min?: number
  flow?: number
  KWh?: string
  IMEI?: string
  KVAh?: string
  Time?: string
  date?: string
  flowrate?: string
  Current_b?: string
  Current_r?: string
  Current_y?: string
  Fault_Bit?: string
  Frequency?: string
  totalizer?: string
  voltage_b?: number
  voltage_r?: number
  voltage_y?: number
  pumpstatus?: string
  String_Type?: string
  Active_Power?: string
  BatteryLevel?: string
  power_factor?: string
  Apparent_Power?: string
  Reactive_Power?: string
  SignalStrength?: string
  Motor_Running_Mode?: string
  max_mm?: number
  min_mm?: number
  last_mm?: number
  first_mm?: number
}

export interface Params {
  height?: number
  shifter: any
  multiplier: any
  maxThreshold?: string
  sensorPostion?: number
  storageCapacity?: number
  A?: number
  B?: number
  sg?: number
  hmax?: number
  hmin?: number
}
