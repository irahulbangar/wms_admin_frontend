export interface SmartReportResponse {
  success: boolean;
  data: SmartReportResult[];
  message: string;
}

export interface SmartReportResult {
  id: number;
  device_id: number;
  from_time: string;
  to_time: string;
  first_record: Record<string, any>;
  last_record: Record<string, any>;
}

