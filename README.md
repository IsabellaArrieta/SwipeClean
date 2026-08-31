# SwipeClean

App Android para limpiar tu galería estilo Tinder: swipe derecha = se queda,
swipe izquierda = va a papelera. La papelera es un panel aparte donde
seleccionas, restauras o borras definitivamente.

## Qué incluye este MVP
- Swipe de fotos y swipe de videos (misma lógica, dos pantallas).
- Contador de progreso ("Revisaste X de Y").
- Botón de deshacer el último swipe.
- Papelera con selección múltiple: restaurar seleccionados, restaurar todo,
  eliminar seleccionados, vaciar papelera.
- El borrado real usa `MediaStore.createDeleteRequest` (Android 11+), que
  muestra una sola confirmación del sistema para todo el lote. Nada se
  borra hasta que tú lo confirmes desde Papelera.

## Cómo abrirlo
1. Instala Android Studio (developer.android.com/studio) si no lo tienes.
2. Abre Android Studio → "Open" → selecciona la carpeta `SwipeClean`.
3. Deja que Android Studio sincronice Gradle (puede tardar unos minutos la
   primera vez y te puede pedir generar el wrapper de Gradle; acepta).
4. Conecta un celular Android (modo desarrollador + depuración USB) o crea
   un emulador desde el Device Manager.
5. Dale ▶ Run.

## Requisitos
- Android 10 (API 29) o superior en el dispositivo/emulador.
- La primera vez que abras Fotos o Videos, la app te pedirá permiso de
  acceso a tus medios.

## Estructura del proyecto
- `data/` — acceso a MediaStore (fotos/videos reales) y base de datos local
  Room que guarda qué quedó marcado para papelera.
- `viewmodel/` — lógica de swipe/deshacer y lógica de papelera/borrado.
- `ui/screens/` — Home, Swipe (fotos y videos), Papelera.
- `ui/components/SwipeCard.kt` — el gesto de arrastre tipo Tinder.

## Siguientes pasos sugeridos
- Ícono y splash screen propios.
- Vista previa reproducible de video (por ahora se ve la miniatura).
- Filtros por álbum o fecha.
