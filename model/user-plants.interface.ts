export interface UserPlantsResponse {
  success: boolean;
  message: string;
  data: UserPlantResult[];
  status: number;
}

export interface UserPlantResult {
  user_plant_id: number;
  plant_id: number;
  user_id: number;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  plant_name: string;
  client_name: string;
}
