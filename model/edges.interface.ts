export type Edges = EdgesResult[];

export interface EdgesResult {
  id: string;
  source: string;
  target: string;
  animated: boolean;
}
