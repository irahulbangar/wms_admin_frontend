export interface BDWFMSDeviceResponse {
  success: boolean;
  data: BDWFMSDeviceResultItem[];
  message: string;
}

export interface BDWFMSDeviceResultItem {
  id: number;
  device_id: number;
  interval_start: string;
  interval_end: string;
  min: string;
  max: string;
  avg: number;
  flow: number;
  from_time: string;
  to_time: string;
  total: number;
}
