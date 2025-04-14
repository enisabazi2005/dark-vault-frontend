import { create } from "zustand";

const useStorageStore = create((set) => ({
    totalStored: 0,
    data: [],
    updateChartData: (chartData) => set({data: chartData}),
    updateTotalStored: (total) => set({ totalStored: total }),
  }));
  
  export default useStorageStore;