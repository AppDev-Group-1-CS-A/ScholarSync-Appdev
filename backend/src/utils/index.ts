import { TextSegment } from "../types";

export const serializeData = <T>(data: T): T =>
  JSON.parse(JSON.stringify(data));

export function generateSlug(text: string): string {
  return text
    .replace(/\.[^/.]+$/, "") // Remove file extension
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const getCurrentBillingPeriodStart = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};
