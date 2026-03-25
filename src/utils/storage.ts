import { DashboardDataset } from "../types";

const STORAGE_KEY = "ecommerce-profit-dashboard:last-dataset";

export const loadStoredDataset = (): DashboardDataset | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardDataset;
  } catch {
    return null;
  }
};

export const saveStoredDataset = (dataset: DashboardDataset) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
};

export const clearStoredDataset = () => {
  localStorage.removeItem(STORAGE_KEY);
};
