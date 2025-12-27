export interface SinglePlantResponse {
  success: boolean;
  message: string;
  data: SinglePlantResult;
  status: number;
}

export interface SinglePlantResult {
  plant_id: number;
  organization_id: number;
  plant_name: string;
  latitude: string;
  longitude: string;
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
  unit: string;
  nodes: Node[];
  edges: Edge[];
  plant_reporting: PlantReporting;
}

export interface PlantReporting {
  report_name: string;
  report_unit: string;
  report_formula: string;
  neutrality_formula: string;
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
  reportName?: string;
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
  crossSectionArea?: number;
  lastRecordTime?: string;
  lastRecord?: Record<string, any>;
  departmentConnection?: string;
  plantConnection?: string;
  organizationConnection?: string;
  departmentName?: string;
  systemName?: string;
  systemConnection?: string;
  plant_id?: string;
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
  reportValue?: number;
  reportType?: string;
  waterColumn?: number;
  batteryVoltage?: number;
  waterTemperature?: number;
  waterPressure?: number;
  total?: number;
  displayParams?: DisplayParam[];
}

export interface DisplayParam {
  name: string;
  report_visible: number;
  diagram_visible: number;
  display_name: string;
  unit: string;
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
