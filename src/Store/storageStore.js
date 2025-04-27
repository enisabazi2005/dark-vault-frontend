import { create } from "zustand";

const useStorageStore = create((set) => ({
    totalStored: 0,
    data: [],
    usersMuted: [],
    updateUsersMuted: (muteList) => set({ usersMuted: muteList }), 
    addMutedUser: (userId) => set((state) => ({ usersMuted: [...state.usersMuted, userId] })),
    removeMutedUser: (userId) => set((state) => ({ usersMuted: state.usersMuted.filter(id => id !== userId) })),
    updateChartData: (chartData) => set({data: chartData}),
    updateTotalStored: (total) => set({ totalStored: total }),
  }));
  
  export default useStorageStore;