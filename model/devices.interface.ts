export interface DeviceResponse {
  success: boolean;
  message: string;
  data: DeviceResult[];
  status: number;
}

export interface DeviceResult {
  device_id: number
  organization_id: number
  in_plant_id?: number
  out_plant_id?: number
  in_department_id?: number
  out_department_id?: number
  in_system_id?: number
  out_system_id: number
  device_family_id: number
  device_type_id: number
  hwid: string
  device_name: string
  device_status: string
  last_record: LastRecord
  last_record_time: string
  params: Params
  visibility: string
  is_deleted: boolean
  organization_connection: string
  device_flow_direction: string
  report_type_id: number
  unit: string
  created_at: string
  updated_at: string
  plant_id: any
  department_id: any
  system_id: any
  device_family: string
  device_family_type: string
  device_type: string
  in_department_name?: string
  out_department_name?: string
  department_name: any
  organization_name: string
  in_plant_name?: string
  out_plant_name?: string
  plant_name: any
  in_plant_latitude?: string
  out_plant_longitude?: string
  in_plant_longitude?: string
  out_plant_latitude?: string
  in_plant_address?: string
  out_plant_address?: string
  in_system_name?: string
  out_system_name: string
  system_name: any
  report_type_name: string
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
  crossSectionArea?: number
}
