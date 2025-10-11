export interface GetPlantsResponse {
  success: boolean;
  message: string;
  data: PlantResult[];
  status: number;
}

export interface PlantResult {
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
