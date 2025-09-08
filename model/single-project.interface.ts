import type { NodesResult } from "./nodes.interface";
import type { EdgesResult } from "./edges.interface";

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
  nodes: Nodes;
  edges: EdgesResult;
}

export interface Nodes {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodesResult;
}
