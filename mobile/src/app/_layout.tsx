import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { Blobs } from '@/components/Blobs';

SplashScreen.preventAutoHideAsync();

function Nav() {
  const { colors, isDark } = useTheme();
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  // El fondo (degradado + manchas) vive aquí, una sola vez, detrás de un Stack
  // transparente: así las manchas no se reinician al cambiar de pantalla y su
  // deriva continúa por debajo de la transición.
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient
        colors={[colors.background, colors.backgroundEnd]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Blobs isDark={isDark} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Nav />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
