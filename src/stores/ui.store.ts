import { create } from 'zustand';

/** Lightweight UI store for cross-cutting modal & drawer state. */
interface UiState {
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMenuOpen: false,
  setMenuOpen: (isMenuOpen) => set({ isMenuOpen }),
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
}));
