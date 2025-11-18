export interface GetOrganizationsResponse {
  success: boolean;
  message: string;
  data: OrganizationResult[];
  status: number;
}

export interface OrganizationResult {
  organization_id: number;
  organization_name: string;
  address: string;
  contact_person: string;
  contact_number: string;
  email: string;
  note: string;
  subdomain: string;
  status: string;
  created_at: string;
  updated_at: string;
}
