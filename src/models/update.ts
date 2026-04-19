import { randomUUID } from "crypto";

export interface Update {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  publishedAt: string | null;
}

const store: Update[] = [];

export function getAllUpdates(): Update[] { return [...store]; }

export function getUpdateById(id: string): Update | undefined {
  return store.find((u) => u.id === id);
}

export function createUpdate(input: Omit<Update, "id" | "createdAt" | "publishedAt">): Update {
  const update: Update = {
    id: randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
    publishedAt: null,
  };
  store.push(update);
  return update;
}

export function deleteUpdate(id: string): boolean {
  const index = store.findIndex((u) => u.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}

export function _resetStore(): void { store.length = 0; }
