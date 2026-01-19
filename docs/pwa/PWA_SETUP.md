# Configuración PWA - RTVC Programación

## ✅ Tareas Completadas

### 1. Manifest.json
- ✅ Creado en `public/manifest.json`
- ✅ Configurado con nombre, colores y metadatos
- ✅ Enlaces a iconos PWA
- ✅ Shortcuts para acceso rápido

### 2. Service Worker
- ✅ Creado en `public/sw.js`
- ✅ Estrategia Network First con fallback a Cache
- ✅ Soporte para funcionamiento offline
- ✅ Cache de recursos estáticos
- ✅ Cache de API requests

### 3. Index.html
- ✅ Meta tags PWA agregados
- ✅ Manifest vinculado
- ✅ Apple touch icons configurados
- ✅ Service Worker registrado automáticamente

### 4. Componentes PWA
- ✅ `InstallPrompt.jsx` - Banner de instalación automático
- ✅ `InstallButton.jsx` - Botón manual para instalar
- ✅ Integrado en App.jsx

### 5. Compartir WhatsApp
- ✅ Utilidades en `utils/whatsappShare.js`
- ✅ Botón en RoutesManagement para compartir despachos
- ✅ Botón en MealManagement para compartir resúmenes
- ✅ Usa API nativa de compartir en móviles
- ✅ Fallback a WhatsApp Web en desktop

### 6. Estilos Responsive
- ✅ Archivo `styles/pwa.css` con estilos móviles
- ✅ Botones táctiles (min 44px)
- ✅ Inputs optimizados para móvil (evita zoom en iOS)
- ✅ Soporte para safe-area-inset (notch de iOS)
- ✅ Animaciones y transiciones

---

## 📱 Generar Iconos PWA

### Opción 1: Usar herramienta online (Recomendado)

1. Ve a https://realfavicongenerator.net/ o https://www.pwabuilder.com/imageGenerator

2. Sube el logo de RTVC (idealmente un PNG de 512x512px con fondo sólido azul #1e40af)

3. Descarga el paquete de iconos generado

4. Coloca los iconos en `public/icons/`:
   ```
   public/icons/
   ├── icon-72x72.png
   ├── icon-96x96.png
   ├── icon-128x128.png
   ├── icon-144x144.png
   ├── icon-152x152.png
   ├── icon-192x192.png
   ├── icon-384x384.png
   └── icon-512x512.png
   ```

### Opción 2: Generar con Sharp (Node.js)

Si tienes Node.js instalado y un logo fuente:

```bash
# 1. Instalar Sharp
npm install sharp

# 2. Colocar tu logo en public/logo-source.png (512x512px recomendado)

# 3. Ejecutar el script
node scripts/generate-icons.js
```

---

## 🚀 Probar la PWA

### En Desarrollo (localhost)

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Abre Chrome/Edge en:
   ```
   http://localhost:5173
   ```

3. Abre DevTools (F12) y ve a la pestaña "Application" > "Service Workers"

4. Verifica que el SW esté registrado y activo

### En Móvil (Red Local)

1. Encuentra tu IP local:
   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```

2. En Vite, el servidor ya expone en la red local. Accede desde tu móvil:
   ```
   http://TU_IP:5173
   ```

3. En Chrome móvil, deberías ver el banner "Agregar a pantalla de inicio"

### En Producción

1. Compila para producción:
   ```bash
   npm run build
   ```

2. Prueba el build:
   ```bash
   npm run preview
   ```

3. Despliega en tu servidor (Netlify, Vercel, etc.)

4. **IMPORTANTE**: La PWA requiere HTTPS en producción

---

## 📊 Funcionalidades PWA Implementadas

### ✅ Instalación
- Banner automático después de 3 segundos
- Botón manual en el menú
- Instrucciones específicas para iOS
- Funciona en Chrome, Edge, Safari

### ✅ Offline
- Service Worker con estrategia Network First
- Cache de recursos estáticos (JS, CSS, imágenes)
- Cache de respuestas API
- Modo degradado cuando no hay internet

### ✅ Compartir WhatsApp
Los asistentes de producción pueden compartir despachos fácilmente:

**Routes (Despachos de Vehículos):**
- Botón "Compartir WhatsApp" visible cuando hay vehículo asignado
- Genera mensaje con:
  - Fecha y turno
  - Vehículo y conductor
  - Ruta y zona
  - Lista de pasajeros con destinos
- Usa API nativa de compartir en móviles

**Meals (Alimentación):**
- Botón "Compartir Resumen" en la barra de acciones
- Genera mensaje con:
  - Tipo de servicio (Desayuno/Almuerzo/Cena)
  - Fecha y programa
  - Lista completa de personal confirmado
  - Indicador de invitados

### ✅ Responsive Design
- Todos los botones tienen min-height: 44px (área táctil óptima)
- Inputs con font-size: 16px (evita zoom en iOS)
- Layouts flexibles que se adaptan a pantalla pequeña
- Textos ocultos en móvil, solo iconos visibles
- Soporte para notch de iPhone (safe-area-inset)

---

## 🔧 Configuración Adicional

### Cambiar Colores Institucionales

Edita `public/manifest.json`:

```json
{
  "theme_color": "#TU_COLOR_AQUI",
  "background_color": "#TU_COLOR_AQUI"
}
```

Y `index.html`:

```html
<meta name="theme-color" content="#TU_COLOR_AQUI" />
```

### Personalizar Mensajes de WhatsApp

Edita `src/utils/whatsappShare.js`:

```javascript
// Personaliza el formato del mensaje
export const generateVehicleDispatchMessage = (dispatch) => {
  // Tu formato personalizado aquí
};
```

### Agregar Más Shortcuts

Edita `public/manifest.json` y agrega en el array `shortcuts`:

```json
{
  "name": "Tu Shortcut",
  "short_name": "Shortcut",
  "description": "Descripción",
  "url": "/tu-ruta",
  "icons": [...]
}
```

---

## 📱 Instalar en Diferentes Dispositivos

### Android (Chrome/Edge)
1. Abre la app en el navegador
2. Toca el menú (⋮) > "Agregar a pantalla de inicio"
3. O espera el banner automático y toca "Instalar"

### iOS (Safari)
1. Abre la app en Safari
2. Toca el botón compartir (📤)
3. Desplázate y toca "Agregar a pantalla de inicio"
4. Toca "Agregar"

### Desktop (Chrome/Edge)
1. Abre la app en el navegador
2. Busca el ícono de instalación en la barra de direcciones
3. O ve al menú > "Instalar RTVC Programación"

---

## 🐛 Troubleshooting

### El Service Worker no se registra
- Verifica que estés en `localhost` o `https://`
- Abre DevTools > Application > Service Workers
- Click en "Unregister" y recarga la página

### Los iconos no aparecen
- Verifica que existan en `public/icons/`
- Verifica las rutas en `manifest.json`
- Limpia el cache del navegador

### El banner de instalación no aparece
- Verifica que el manifest esté correctamente vinculado
- Verifica que todos los iconos existan
- En Chrome, solo aparece si el usuario interactúa con el sitio
- En iOS, no hay banner automático (seguir instrucciones manuales)

### WhatsApp no se abre en móvil
- Verifica que WhatsApp esté instalado
- Prueba el protocolo `whatsapp://` en lugar de `https://wa.me/`
- La API de compartir nativa solo funciona con HTTPS

### Los botones son difíciles de tocar
- Verifica que `pwa.css` esté importado en `App.jsx`
- Agrega clase `min-h-[44px]` a botones pequeños
- Aumenta el padding si es necesario

---

## 📚 Recursos Adicionales

- [PWA Builder](https://www.pwabuilder.com/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [WhatsApp URL Scheme](https://faq.whatsapp.com/1549566742332687)

---

## ✨ Próximas Mejoras Sugeridas

- [ ] Push Notifications para alertas importantes
- [ ] Background Sync para enviar datos cuando vuelve la conexión
- [ ] Badge API para mostrar contadores en el ícono
- [ ] Shortcuts dinámicos basados en uso frecuente
- [ ] Modo oscuro automático
- [ ] Caché más agresivo para imágenes
- [ ] Precarga de rutas frecuentes

---

## 📝 Notas Importantes

1. **HTTPS es obligatorio** en producción para PWA
2. **Service Worker se actualiza** cada 24 horas automáticamente
3. **Cache se limpia** cuando cambias CACHE_NAME en sw.js
4. **iOS tiene limitaciones** (sin push notifications, sin background sync)
5. **Prueba siempre en dispositivos reales** antes de producción

---

¡Tu aplicación RTVC ahora es una PWA completa! 🎉
