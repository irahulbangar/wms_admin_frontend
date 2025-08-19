export interface GetProjectsResponse {
  success: boolean;
  message: string;
  data: ProjectResult[];
}

export interface ProjectResult {
  plant_id: number;
  organization_id: number;
  plant_name: string;
  latitude: string;
  longitude: string;
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
}
