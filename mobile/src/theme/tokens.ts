// Paleta índigo + acentos semánticos. Portado de ui/theme/Color.kt del proyecto Android.

export const Indigo = {
  50: '#EEF0FE',
  100: '#D9DCFC',
  200: '#C7CBFB',
  400: '#818CF8',
  600: '#6366F1',
  800: '#4338CA',
  900: '#2E2A8F',
};

export const Semantic = {
  success: '#10B981',
  danger: '#F43F5E',
  dangerLight: '#FB7185',
  amber: '#F59E0B',
  amberLight: '#FBBF24',
};

export type Scheme = {
  primary: string;
  primaryLight: string;
  onPrimary: string;
  background: string;
  backgroundEnd: string;
  surface: string;
  onSurface: string;
  onSurfaceVariant: string;
  border: string;
};

export const light: Scheme = {
  primary: Indigo[600],
  primaryLight: Indigo[400],
  onPrimary: '#FFFFFF',
  background: '#F8FAFC',
  backgroundEnd: '#F0F4FF',
  surface: '#FFFFFF',
  onSurface: '#0F172A',
  onSurfaceVariant: '#475569',
  border: 'rgba(99,102,241,0.12)',
};

export const dark: Scheme = {
  primary: Indigo[400],
  primaryLight: Indigo[200],
  onPrimary: Indigo[900],
  background: '#0F172A',
  backgroundEnd: '#1A1F3A',
  surface: '#1E293B',
  onSurface: '#F1F5F9',
  onSurfaceVariant: '#94A3B8',
  border: 'rgba(129,140,248,0.15)',
};

export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 };
