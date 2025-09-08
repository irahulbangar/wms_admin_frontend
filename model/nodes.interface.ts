export type NodesResponse = NodesResult[];

export interface NodesResult {
  id: string;
  data: Data;
  position: Position;
  style?: Style;
  type: string;
  width: number;
  height: number;
  parentId?: string;
  sourcePosition?: string;
  targetPosition?: string;
  selected?: boolean;
  positionAbsolute?: PositionAbsolute;
  dragging?: boolean;
}

export interface Data {
  label: string;
  type: string;
  unit: string;
  direction?: string;
  totalVolume?: number;
  totalizerReading?: number;
  flowRate?: number;
  isActive?: boolean;
  capacity?: number;
  currentLevel?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Style {
  width: number;
  height: number;
  borderRadius: number;
  border: string;
}

export interface PositionAbsolute {
  x: number;
  y: number;
}
