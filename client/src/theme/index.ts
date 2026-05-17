import { makeAutoObservable } from 'mobx';
import { createTheme } from '@mui/material/styles';

import type { Priority } from '../types';

class ThemeStore {
  isDark = localStorage.getItem('tm_dark') !== 'false';

  constructor() {
    makeAutoObservable(this);
  }

  toggleTheme = () => {
    this.isDark = !this.isDark;
    localStorage.setItem('tm_dark', String(this.isDark));
  };
}

export const themeStore = new ThemeStore();

export function getTheme(dark: boolean) {
  return createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
      primary: { main: '#5C6BC0' },
      secondary: { main: '#26C6DA' },
      background: {
        default: dark ? '#0E1117' : '#F0F2F8',
        paper: dark ? '#1A1F2E' : '#FFFFFF',
      },
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
      h5: { fontWeight: 800 },
      h6: { fontWeight: 700 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
            boxShadow: dark ? '0 2px 16px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.06)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 700, borderRadius: 8 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 700 },
        },
      },
    },
  });
}

export const PRIORITY_CONFIG: Record<Priority, { color: string; label: string; dot: string }> = {
  urgent: { color: '#F44336', label: 'Urgent', dot: '🔴' },
  high: { color: '#FF9800', label: 'High', dot: '🟠' },
  medium: { color: '#2196F3', label: 'Medium', dot: '🔵' },
  low: { color: '#9E9E9E', label: 'Low', dot: '⚪' },
};

export const LABEL_CONFIG: Record<string, { color: string; bg: string }> = {
  feature: { color: '#5C6BC0', bg: '#5C6BC022' },
  bug: { color: '#F44336', bg: '#F4433622' },
  design: { color: '#E91E63', bg: '#E91E6322' },
  docs: { color: '#FF9800', bg: '#FF980022' },
  devops: { color: '#4CAF50', bg: '#4CAF5022' },
  marketing: { color: '#9C27B0', bg: '#9C27B022' },
};

export const BOARD_COLORS = [
  '#5C6BC0',
  '#E91E63',
  '#4CAF50',
  '#FF9800',
  '#00BCD4',
  '#9C27B0',
  '#F44336',
  '#2196F3',
];
