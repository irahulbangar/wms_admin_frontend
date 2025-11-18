export interface SingleOrganizationResponse {
  success: boolean
  message: string
  data: SingleOrganizationResult
}

export interface SingleOrganizationResult {
  organization_id: number
  organization_name: string
  address: string
  contact_person: string
  contact_number: string
  email: string
  note: string
  nodes: Nodes[]
  edges: Edges[]
  status: string
  logo: any
  introduction: string
  governance: string
  subdomain: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Nodes {
  id: string
  data: NodeData
  type: string
  style?: Style
  width: number
  height: number
  position: Position
  dragging?: boolean
  parentId?: string
  selected?: boolean
  sourcePosition?: string
  targetPosition?: string
  positionAbsolute?: PositionAbsolute
}

export interface NodeData {
  type: string;
  unit: string;
  label: string;
  flowRate?: number;
  isActive?: boolean;
  direction?: string;
  totalVolume?: number;
  totalizerReading?: number;
  capacity?: number;
  currentLevel?: number | string;
  height?: number;
  departmentConnection?: string;
  plantConnection?: string;
  organizationConnection?: string;
  departmentName?: string;
  avg?: number;
  max?: number;
  min?: number;
  pumpStatus?: string;
  voltageR?: number;
  voltageY?: number;
  voltageB?: number;
  currentR?: number;
  currentY?: number;
  currentB?: number;
  current?: number;
  frequency?: number;
  maxMm?: number;
  minMm?: number;
  lastMm?: number;
  firstMm?: number;
}

export interface Style {
  width: number;
  border: string;
  height: number;
  borderRadius: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface PositionAbsolute {
  x: number;
  y: number;
}

export interface Edges {
  id: string
  source: string
  target: string
  animated: boolean
}
