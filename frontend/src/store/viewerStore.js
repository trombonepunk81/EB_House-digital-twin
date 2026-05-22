import { create } from 'zustand'

export const useViewerStore = create((set) => ({
  // Model state
  modelMetadata: null,
  setModelMetadata: (metadata) => set({ modelMetadata: metadata }),

  // Loading state
  loadingState: { loading: false, progress: 0, error: null },
  setLoadingState: (loadingState) => set({ loadingState }),

  // Selected element
  selectedElement: null,
  setSelectedElement: (el) => set({ selectedElement: el }),
}))

export const useAssetStore = create((set, get) => ({
  assets: [],

  addAsset: (asset) => set((state) => ({
    assets: [...state.assets, { ...asset, id: Date.now(), createdAt: new Date().toISOString() }]
  })),

  updateAsset: (id, updates) => set((state) => ({
    assets: state.assets.map(a => a.id === id ? { ...a, ...updates } : a)
  })),

  deleteAsset: (id) => set((state) => ({
    assets: state.assets.filter(a => a.id !== id)
  })),

  getAsset: (id) => get().assets.find(a => a.id === id),
}))
