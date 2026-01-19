# 🚀 Instalación Rápida de la PWA RTVC

## ✅ Todo Está Listo

Ya corregí todos los problemas:
- ✅ Service Worker estable (sin errores de actualización)
- ✅ Manifest.json válido con todos los campos
- ✅ Iconos SVG generados (192x192 y 512x512)
- ✅ Botón "Instalar App RTVC" en el Sidebar

---

## 🎯 Pasos para Probar (5 minutos)

### 1. Limpiar Todo
```bash
# En Chrome DevTools (F12):
# Application > Storage > Clear site data > Clear all

# O desde consola del navegador:
localStorage.clear();
sessionStorage.clear();
```

### 2. Desregistrar Service Workers Antiguos
```bash
# En Chrome DevTools:
# Application > Service Workers > Click "Unregister" en todos
```

### 3. Reiniciar Servidor
```bash
# Detener el servidor (Ctrl+C)
npm run dev
```

### 4. Abrir la App
```
http://localhost:5173
```

### 5. Verificar en DevTools

**Pestaña Console:**
```
✅ Service Worker registrado correctamente
   Scope: http://localhost:5173/
   Estado: Activo
```

**Pestaña Application > Manifest:**
```
✅ Identity
   Name: RTVC Programación - Sistema de Coordinación
   Short name: RTVC

✅ Presentation
   Display: standalone
   Theme color: #1e40af
   Background color: #1e3a8a

✅ Icons
   192x192 ✓
   512x512 ✓
```

**Pestaña Application > Service Workers:**
```
Status: ● activated and is running
Source: sw.js
```

---

## 📱 Instalar la App

### Opción 1: Desde el Sidebar (Recomendado)
1. Abre el menú lateral (botón hamburguesa en móvil)
2. Busca el botón azul "**Instalar App RTVC**"
3. Click → Instalar
4. ¡Listo! Verás un badge verde "App Instalada ✓"

### Opción 2: Desde el Navegador
**Desktop (Chrome/Edge):**
- Busca el ícono **+** en la barra de direcciones
- Click → Instalar

**Móvil (Android Chrome):**
- Espera el banner "Agregar a pantalla de inicio"
- O menú ⋮ → "Instalar aplicación"

**iOS (Safari):**
- Botón compartir 📤
- "Agregar a pantalla de inicio"

---

## 🎨 Cómo Se Ve

### En el Sidebar (NO instalada):
```
┌─────────────────────────────┐
│  [Gradiente Azul]           │
│                             │
│  ⬇️ Instalar App RTVC       │
│                             │
│  Instala para acceso rápido │
│  y uso sin conexión         │
└─────────────────────────────┘
```

### En el Sidebar (YA instalada):
```
┌─────────────────────────────┐
│  ● App Instalada ✓          │
│  [Badge verde pulsante]     │
└─────────────────────────────┘
```

---

## 🔧 Si Algo No Funciona

### "No veo el botón Instalar"
1. Verifica que NO esté ya instalada (busca el badge verde)
2. Espera 30 segundos después de cargar la página
3. Chrome necesita tiempo para detectar que es una PWA válida

### "Sale error en el Service Worker"
```bash
# Ejecutar script de verificación:
node scripts/verify-pwa.js

# Si todo está ✅, solo necesitas:
# 1. Unregister SW antiguos en DevTools
# 2. Hard refresh: Ctrl+Shift+R
```

### "Los iconos no cargan"
```bash
# Regenerar iconos:
node scripts/generate-pwa-icons.js

# Verificar que existan:
ls public/icons/
```

---

## 📊 Checklist Rápido

Antes de llamarme, verifica:
- [ ] Servidor corriendo en localhost:5173
- [ ] DevTools > Application > Manifest (sin errores)
- [ ] DevTools > Application > Service Workers (activado)
- [ ] Console sin errores rojos
- [ ] Esperé al menos 30 segundos
- [ ] Limpié cache y desregistré SWs antiguos

---

## 🎉 Una Vez Instalada

Los asistentes podrán:
- ✅ Abrir la app desde el escritorio/home screen
- ✅ Usar sin internet (modo offline)
- ✅ Recibir notificaciones (futuro)
- ✅ Experiencia nativa (sin barra del navegador)
- ✅ Sincronización automática al recuperar conexión

---

## 📚 Documentación Completa

Para más detalles técnicos, ver:
- **PWA_COMPLETE_GUIDE.md** - Guía completa con código
- **PWA_SETUP.md** - Documentación original

---

## 🆘 Soporte

Si después de seguir estos pasos aún tienes problemas:

1. Ejecuta el verificador:
```bash
node scripts/verify-pwa.js
```

2. Copia el output de la consola del navegador (DevTools)

3. Revisa PWA_COMPLETE_GUIDE.md sección "Troubleshooting"

---

**¡Tu PWA está lista! 🎉**

El botón "Instalar App RTVC" aparecerá automáticamente en el Sidebar cuando Chrome detecte que la app es instalable (toma ~30 segundos).
