import { create } from "zustand";
import { Season } from "../../types";

interface DashboardStore {
  season: Season | null;
  setSeason: (season: Season) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  season: null,
  setSeason: (season) => set({ season }),
}));
