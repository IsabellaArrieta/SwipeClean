# SwipeClean

App móvil para limpiar tu galería estilo Tinder: **desliza a la derecha para
conservar, a la izquierda para mandar a la papelera**. Nada se borra hasta que
tú lo confirmes desde la Papelera, con el diálogo del propio sistema.

Hecha con Expo + React Native, así que corre en Android y iOS con una sola base
de código.

## Qué hace

- **Revisión con swipe** de fotos y videos, con la tarjeta que rota y sale
  volando, y el fondo cambiando de color según el lado.
- **Retoma donde quedaste**: recuerda el último elemento revisado de cada tipo,
  incluso si cierras la app o te llegan fotos nuevas por WhatsApp.
- **Papelera** con selección múltiple: restaurar, eliminar seleccionados o
  vaciar. El borrado real usa el diálogo de confirmación del sistema.
- **Galería en cuadrícula** con scroll infinito, barra de desplazamiento rápida
  con contador, y miniaturas de video cacheadas en disco.
- **Deshacer** el último swipe.
- **Tema claro/oscuro** con transición animada, guardado entre sesiones.
- Fotos y videos horizontales se ven completos sobre un fondo desenfocado de sí
  mismos, sin recortes ni bandas negras.

## Stack

| Pieza | Librería |
|---|---|
| Navegación | `expo-router` (rutas por archivos) |
| Galería y borrado real | `expo-media-library` |
| Papelera (soft-delete) | `expo-sqlite` |
| Checkpoint y preferencias | `AsyncStorage` |
| Estado | `zustand` |
| Gestos y animaciones | `react-native-reanimated` + `react-native-gesture-handler` |
| Listas grandes | `@shopify/flash-list` |
| Imágenes | `expo-image` |
| Video | `expo-video` + `expo-video-thumbnails` |

## Estructura

```
mobile/
  src/
    app/                    Pantallas (expo-router)
      _layout.tsx           Stack raíz, tema, gestos
      index.tsx             Inicio
      swipe/[type].tsx      Revisión (type = photo | video)
      gallery/[type].tsx    Galería en cuadrícula
      trash.tsx             Papelera
      stats.tsx  info.tsx   Estadísticas y créditos
    components/             SwipeCard, VideoCard, Thumb, FastScrollbar, ui…
    lib/                    media, db (sqlite), storage, videoThumb
    store/                  useSwipeStore, useTrashStore
    theme/                  Paleta y contexto de tema
  scripts/gen-icons.mjs     Genera los íconos de la app
```

## Correr el proyecto

Necesitas Node y una **development build** instalada en el teléfono (la app
lleva librerías nativas, así que Expo Go no sirve).

```bash
cd mobile
npx expo start --dev-client
```

Abre la app en el teléfono y conéctala al QR. A partir de ahí, cada cambio en el
código recarga solo.

### Compilar el APK

Solo hace falta al agregar una librería nativa o al tocar `app.json`:

```bash
npx eas-cli build -p android --profile development   # para desarrollar
npx eas-cli build -p android --profile preview       # APK instalable
```

## Requisitos

- Android 10 (API 29) o superior.
- Permiso de acceso a fotos y videos: la app lo pide la primera vez. Si lo
  niegas, entra en un modo demo con contenido de prueba.

## Pendientes

- Estadísticas de espacio liberado.
- Doble tap para ver en pantalla completa.
- Rediseño con acabado glassmorphism.
- Publicación en tiendas.

---

Desarrollada por **Isabella Arrieta** ([@IsabellaArrieta](https://github.com/IsabellaArrieta)).
Asistencia de código: Claude.
