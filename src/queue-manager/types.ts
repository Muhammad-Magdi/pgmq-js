export interface Queue {
  name: string;
  createdAt: Date;
  isPartitioned: boolean;
  isUnlogged: boolean;
}
