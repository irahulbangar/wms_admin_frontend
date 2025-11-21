export interface DataSyncResponse {
  success: boolean;
  status: number;
  data: DataSyncResult;
  message: string;
}

export interface DataSyncResult {
  count: number;
  updateCount: number;
  insertCount: number;
  skipCount: number;
  errors: Error[];
}

export interface Error {
  index: number;
  message: string;
}
