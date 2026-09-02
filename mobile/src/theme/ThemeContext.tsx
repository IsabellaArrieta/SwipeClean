import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
