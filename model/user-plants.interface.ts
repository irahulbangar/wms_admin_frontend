export interface UserPlantsResponse {
  success: boolean;
  message: string;
  data: UserPlantResult[];
}

export interface UserPlantResult {
  user_plant_id: number;
  project_id: number;
  user_id: number;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  project_name: string;
  client_name: string;
}
