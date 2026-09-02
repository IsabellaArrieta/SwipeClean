import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';

import { dark, light, type Scheme } from './tokens';

const KEY = 'dark_mode_enabled';

type ThemeCtx = {
  isDark: boolean;
  colors: Scheme;
  toggle: () => void;
};

const Ctx = createContext<ThemeCtx>({ isDark: false, colors: light, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v != null) setIsDark(v === 'true');
    });
  }, []);

  // Pinta el fondo nativo de la ventana para que las transiciones entre
  // pantallas no muestren un flash blanco en modo oscuro.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(isDark ? dark.background : light.background);
  }, [isDark]);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(KEY, String(next));
      return next;
    });
  };

  return (
    <Ctx.Provider value={{ isDark, colors: isDark ? dark : light, toggle }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
