import { Queue } from "./types";

export const parseDbQueue = (q: string): Queue => {
  const parts = q.substring(1, q.length - 1).split(",");
  return {
    name: parts[0],
    createdAt: new Date(parts[1]),
    isPartitioned: parts[2] === "t",
    isUnlogged: parts[3] === "t",
  };
};
