# SwipeClean (Expo / React Native)

Migración de la app Android (Kotlin/Compose) a Expo + TypeScript para tener
iOS y Android con una sola base de código.

## Stack

- **expo-router** — navegación por archivos (`src/app/`)
- **expo-media-library** — leer galería + borrado real con diálogo del sistema
- **expo-sqlite** — papelera (soft-delete), en `src/lib/db.ts`
- **AsyncStorage** — checkpoint de revisión + preferencia de tema
- **zustand** — estado (`src/store/`), equivalente a los ViewModel de Android
- **react-native-reanimated** + **gesture-handler** — la SwipeCard tipo Tinder
- **expo-video** — player de video con slider

## Estructura

```
src/
  app/
    _layout.tsx          Stack raíz + ThemeProvider + GestureHandlerRootView
    index.tsx            Home
    swipe/[type].tsx     Revisión con swipe (type = photo | video)
    gallery/[type].tsx   Galería en grid + multiselección
    trash.tsx            Papelera
    stats.tsx / settings.tsx
  components/  SwipeCard, VideoCard, Thumb, ui (Header/PillButton/CircleIconButton)
  lib/         media (media-library), db (sqlite), storage (asyncstorage)
  store/       useSwipeStore, useTrashStore
  theme/       tokens (paleta índigo), ThemeContext (claro/oscuro persistido)
```

## Correr

```bash
cd mobile
npx expo start
```

Luego:

- **Celular (rápido):** instala **Expo Go** (Play Store / App Store) y escanea el QR.
  Todo funciona en Expo Go salvo el borrado permanente real, que necesita un dev build.
- **Emulador Android:** con Android Studio abierto, pulsa `a` en la terminal.
- **Dev build (para probar el borrado real):**
  ```bash
  npx expo run:android      # requiere Android SDK
  npx expo run:ios          # requiere macOS + Xcode
  ```

## Estado de la migración

Portado: Home, Swipe (fotos y video), Galería, Papelera con borrado real,
tema claro/oscuro, checkpoint (retomar donde quedaste), deshacer.

Pendiente: pantallas Stats y Ajustes (placeholders), scrollbar rápida de la
galería, cálculo de espacio liberado, íconos/splash propios.
