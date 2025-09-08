export interface SingleProjectResponse {
  success: boolean;
  message: string;
  data: SingleProjectResult;
}

export interface SingleProjectResult {
  project_id: number;
  organization_id: number;
  project_name: string;
  latitude: string;
  longitude: string;
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
  nodes: Node[];
  edges: Edge[];
}

export interface Node {
  id: string;
  data: NodeData;
  type: string;
  style?: Style;
  width: number;
  height: number;
  position: Position;
  dragging?: boolean;
  parentId?: string;
  selected?: boolean;
  sourcePosition?: string;
  targetPosition?: string;
  positionAbsolute?: PositionAbsolute;
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

export interface Edge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
}
