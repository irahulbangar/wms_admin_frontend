export interface GetOrganizationsResponse {
  success: boolean;
  message: string;
  data: OrganizationResult[];
}

export interface OrganizationResult {
  organization_id: string;
  org_name: string;
  address: string;
  contact_person: string;
  contact_number: string;
  email: string;
  note: string;
  created_at: string;
  updated_at: string;
}
