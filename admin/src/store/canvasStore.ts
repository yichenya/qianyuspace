import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface CanvasElement {
  id: string;
  type: 'image' | 'video' | 'text' | 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  attrs: {
    src?: string;
    text?: string;
    fontSize?: number;
    fill?: string;
    [key: string]: any;
  };
}

interface Position {
  x: number;
  y: number;
}

interface CanvasState {
  elements: CanvasElement[];
  scale: number;
  position: Position;
  selectedIds: string[];
  isDirty: boolean;
  lastSaved: string | null;
}

interface CanvasActions {
  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, newAttrs: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  deleteSelectedElements: () => void;
  duplicateElement: (id: string) => void;
  setScale: (scale: number) => void;
  setPosition: (position: Position) => void;
  setSelectedIds: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  moveSelected: (dx: number, dy: number) => void;
  setDirty: (dirty: boolean) => void;
  setLastSaved: (time: string) => void;
  loadCanvas: (data: { elements: CanvasElement[]; scale: number; position: Position }) => void;
  resetCanvas: () => void;
}

const initialState: CanvasState = {
  elements: [],
  scale: 1,
  position: { x: 0, y: 0 },
  selectedIds: [],
  isDirty: false,
  lastSaved: null,
};

export const useCanvasStore = create<CanvasState & CanvasActions>()(
  immer((set) => ({
    ...initialState,

    setElements: (elements) =>
      set((state) => {
        state.elements = elements;
        state.isDirty = true;
      }),

    addElement: (element) =>
      set((state) => {
        state.elements.push(element);
        state.isDirty = true;
      }),

    updateElement: (id, newAttrs) =>
      set((state) => {
        const el = state.elements.find((el) => el.id === id);
        if (el) {
          Object.assign(el, newAttrs);
          state.isDirty = true;
        }
      }),

    deleteElement: (id) =>
      set((state) => {
        const index = state.elements.findIndex((el) => el.id === id);
        if (index !== -1) {
          state.elements.splice(index, 1);
          state.selectedIds = state.selectedIds.filter((sid) => sid !== id);
          state.isDirty = true;
        }
      }),

    deleteSelectedElements: () =>
      set((state) => {
        state.elements = state.elements.filter(
          (el) => !state.selectedIds.includes(el.id)
        );
        state.selectedIds = [];
        state.isDirty = true;
      }),

    duplicateElement: (id) =>
      set((state) => {
        const el = state.elements.find((el) => el.id === id);
        if (el) {
          const newEl = {
            ...el,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: el.x + 20,
            y: el.y + 20,
          };
          state.elements.push(newEl);
          state.isDirty = true;
        }
      }),

    setScale: (scale) =>
      set((state) => {
        state.scale = Math.max(0.1, Math.min(5, scale));
      }),

    setPosition: (position) =>
      set((state) => {
        state.position = position;
      }),

    setSelectedIds: (ids) =>
      set((state) => {
        state.selectedIds = ids;
      }),

    addToSelection: (id) =>
      set((state) => {
        if (!state.selectedIds.includes(id)) {
          state.selectedIds.push(id);
        }
      }),

    removeFromSelection: (id) =>
      set((state) => {
        state.selectedIds = state.selectedIds.filter((sid) => sid !== id);
      }),

    clearSelection: () =>
      set((state) => {
        state.selectedIds = [];
      }),

    selectAll: () =>
      set((state) => {
        state.selectedIds = state.elements.map((el) => el.id);
      }),

    moveSelected: (dx, dy) =>
      set((state) => {
        state.selectedIds.forEach((id) => {
          const el = state.elements.find((el) => el.id === id);
          if (el) {
            el.x += dx;
            el.y += dy;
          }
        });
        state.isDirty = true;
      }),

    setDirty: (dirty) =>
      set((state) => {
        state.isDirty = dirty;
      }),

    setLastSaved: (time) =>
      set((state) => {
        state.lastSaved = time;
        state.isDirty = false;
      }),

    loadCanvas: (data) =>
      set((state) => {
        state.elements = data.elements;
        state.scale = data.scale;
        state.position = data.position;
        state.selectedIds = [];
        state.isDirty = false;
      }),

    resetCanvas: () =>
      set((state) => {
        Object.assign(state, initialState);
      }),
  }))
);