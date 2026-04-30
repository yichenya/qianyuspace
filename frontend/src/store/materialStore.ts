import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Material } from '../types';

// 素材状态接口
interface MaterialState {
  materials: Material[];
  favoriteMaterials: Material[];
  setMaterials: (materials: Material[]) => void;
  addMaterial: (material: Material) => void;
  deleteMaterial: (materialId: number) => void;
  setFavoriteMaterials: (materials: Material[]) => void;
  addFavoriteMaterial: (material: Material) => void;
  removeFavoriteMaterial: (materialId: number) => void;
}

// 创建素材状态管理
export const useMaterialStore = create<MaterialState>()(
  persist(
    (set) => ({
      materials: [],
      favoriteMaterials: [],
      setMaterials: (materials) => set({ materials }),
      addMaterial: (material) => set((state) => {
        if (state.materials.some((item) => item.id === material.id)) {
          return state;
        }
        return {
          materials: [material, ...state.materials],
        };
      }),
      deleteMaterial: (materialId) => set((state) => ({
        materials: state.materials.filter(material => material.id !== materialId),
        favoriteMaterials: state.favoriteMaterials.filter(material => material.id !== materialId)
      })),
      setFavoriteMaterials: (materials) => set({ favoriteMaterials: materials }),
      addFavoriteMaterial: (material) => set((state) => ({
        favoriteMaterials: [material, ...state.favoriteMaterials]
      })),
      removeFavoriteMaterial: (materialId) => set((state) => ({
        favoriteMaterials: state.favoriteMaterials.filter(material => material.id !== materialId)
      })),
    }),
    {
      name: 'material-storage',
    }
  )
);
