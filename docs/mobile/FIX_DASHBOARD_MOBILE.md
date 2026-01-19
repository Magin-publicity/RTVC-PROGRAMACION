# ✅ Fix Dashboard en Móvil - URLs Hardcodeadas

## ❌ Problema

El Dashboard no mostraba los números de disponibilidad en el celular. Las tarjetas mostraban "..." en lugar de los valores.

**Captura del problema:**
- "Disponibilidad Camarógrafos" → "..."
- "Disponibilidad Realizadores" → "..."
- "Equipos LiveU" → "0 de 0 Disponibles"

## 🔍 Causa Raíz

El componente `AdminDashboard.jsx` tenía **URLs hardcodeadas con `http://localhost:3000`** en todos los fetch:

```javascript
// ❌ ANTES (NO FUNCIONA DESDE EL CELULAR)
const response = await fetch('http://localhost:3000/api/reporteria-espacios/disponibilidad/...', {
  // ...
});
```

**Problema:** Cuando abres la app desde el celular (`http://192.168.1.26:5173`), el navegador intenta conectarse a `localhost:3000` **del celular**, no de tu PC.

```
Celular (192.168.1.26:5173)
    ↓
Intenta fetch a: http://localhost:3000
    ↓
❌ ERROR: localhost del celular no tiene backend
    ↓
Dashboard muestra "..." (sin datos)
```

## ✅ Solución

Reemplazar todas las URLs hardcodeadas por **rutas relativas** que Vite proxy automáticamente:

```javascript
// ✅ DESPUÉS (FUNCIONA EN PC Y CELULAR)
const response = await fetch('/api/reporteria-espacios/disponibilidad/...', {
  // ...
});
```

**Flujo correcto:**

```
Celular (192.168.1.26:5173)
    ↓
fetch('/api/reporteria-espacios/...')
    ↓
Vite Proxy intercepta (configurado en vite.config.js)
    ↓
Redirige a: http://localhost:3000/api/...
    ↓
✅ Backend responde con datos
    ↓
Dashboard muestra números correctamente
```

---

## 🔧 Cambios Realizados

### Archivo: [src/components/Dashboard/AdminDashboard.jsx](src/components/Dashboard/AdminDashboard.jsx)

Se reemplazaron **13 URLs hardcodeadas** con rutas relativas:

| Línea | URL Antes | URL Después |
|-------|-----------|-------------|
| 42 | `http://localhost:3000/api/reporteria-espacios/disponibilidad/...` | `/api/reporteria-espacios/disponibilidad/...` |
| 92 | `http://localhost:3000/api/fleet/availability/...` | `/api/fleet/availability/...` |
| 103 | `http://localhost:3000/api/fleet/dispatches/...` | `/api/fleet/dispatches/...` |
| 137 | `http://localhost:3000/api/logistics/liveu/stats...` | `/api/logistics/liveu/stats...` |
| 160 | `http://localhost:3000/api/logistics/liveu/detalle/...` | `/api/logistics/liveu/detalle/...` |
| 185 | `http://localhost:3000/api/logistics/liveu/detalle/...` | `/api/logistics/liveu/detalle/...` |
| 189 | `http://localhost:3000/api/logistics/liveu/stats...` | `/api/logistics/liveu/stats...` |
| 200 | `http://localhost:3000/api/logistics/liveu/${liveuId}` | `/api/logistics/liveu/${liveuId}` |
| 223 | `http://localhost:3000/api/logistics/liveu` | `/api/logistics/liveu` |
| 252 | `http://localhost:3000/api/logistics/liveu/${liveuId}` | `/api/logistics/liveu/${liveuId}` |
| 283 | `http://localhost:3000/api/logistics/liveu/${liveuId}` | `/api/logistics/liveu/${liveuId}` |
| 304 | `http://localhost:3000/api/reporteria-espacios/detalle/camarografos/...` | `/api/reporteria-espacios/detalle/camarografos/...` |
| 324 | `http://localhost:3000/api/asignaciones-realizadores/detalle/...` | `/api/asignaciones-realizadores/detalle/...` |
| 344 | `http://localhost:3000/api/reporteria-espacios/detalle/asistentes/...` | `/api/reporteria-espacios/detalle/asistentes/...` |
| 364 | `http://localhost:3000/api/fleet/detalle/...` | `/api/fleet/detalle/...` |
| 384 | `http://localhost:3000/api/logistics/liveu/detalle/...` | `/api/logistics/liveu/detalle/...` |

---

## 📋 Cómo Funciona el Proxy de Vite

El archivo [vite.config.js](vite.config.js) ya tiene configurado el proxy:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq, req) => {
          console.log('[Proxy]', req.method, req.url, '→', 'http://localhost:3000');
        });
      }
    }
  }
}
```

**Funcionamiento:**

1. **Cliente hace fetch:** `fetch('/api/reporteria-espacios/disponibilidad/2026-01-19')`
2. **Vite detecta:** La ruta empieza con `/api`
3. **Vite redirige:** A `http://localhost:3000/api/reporteria-espacios/disponibilidad/2026-01-19`
4. **Backend responde:** Con los datos
5. **Cliente recibe:** Los datos como si viniera de `/api`

**Ventajas:**
- ✅ Funciona en **PC** (`localhost:5173`)
- ✅ Funciona en **celular** (`192.168.1.26:5173`)
- ✅ Funciona en **producción** (con configuración de CORS)
- ✅ No hay problemas de CORS

---

## 🧪 Verificación

### 1. En la Terminal de Vite

Cuando hagas fetch desde el celular, deberías ver en la terminal de Vite:

```
[Proxy] GET /api/reporteria-espacios/disponibilidad/2026-01-19 → http://localhost:3000
[Proxy] GET /api/fleet/availability/2026-01-19 → http://localhost:3000
[Proxy] GET /api/logistics/liveu/stats?date=2026-01-19 → http://localhost:3000
```

### 2. En DevTools del Celular

Conecta el celular por USB y abre Chrome Remote Debugging:

1. PC: `chrome://inspect#devices`
2. Click en "Inspect" debajo de `192.168.1.26:5173`
3. Pestaña **Network**
4. Recarga la página
5. Busca las peticiones a `/api/reporteria-espacios/...`
6. **Status:** Debe ser `200 OK`
7. **Response:** Debe tener los datos JSON

---

## 🎯 Resultado Esperado

### Dashboard en el Celular:

```
┌────────────────────────────────┐
│  Disponibilidad Camarógrafos   │
│           [12]                 │ ← Ahora muestra el número
│      de 15 En Canal            │
└────────────────────────────────┘

┌────────────────────────────────┐
│  Disponibilidad Realizadores   │
│            [8]                 │ ← Ahora muestra el número
│      de 10 En Canal            │
└────────────────────────────────┘

┌────────────────────────────────┐
│     Equipos LiveU              │
│            [5]                 │ ← Ahora muestra el número
│    de 8 Disponibles            │
│   🔵 3 En Terreno              │
└────────────────────────────────┘
```

---

## 🔄 Próximos Pasos

### 1. Reinicia Vite

```bash
# Ctrl+C para detener
npm run dev
```

### 2. Desde el Celular

1. Abre Chrome
2. Ve a: `http://192.168.1.26:5173`
3. Espera que cargue completamente
4. **Verifica:**
   - ✅ Los números de disponibilidad aparecen
   - ✅ Las tarjetas muestran datos reales
   - ✅ No aparece "..." en las tarjetas

### 3. Si Sigue sin Funcionar

**Limpia el cache del navegador:**

```
Chrome móvil → Menú ⋮ → Configuración → Privacidad
→ Borrar datos de navegación → Cache + Cookies
→ Recargar la página
```

---

## 📝 Archivos Relacionados Que Ya Usan Rutas Relativas

Estos componentes **ya estaban correctos** (usando rutas relativas):

- ✅ [src/components/Auth/LoginPage.jsx](src/components/Auth/LoginPage.jsx)
- ✅ [src/App.jsx](src/App.jsx) (logout)
- ✅ [src/config/api.js](src/config/api.js)

### Archivos Pendientes de Revisar

Puede que haya otros componentes con URLs hardcodeadas:

- [ ] `src/hooks/useRealtimeSync.js`
- [ ] `src/components/Assignments/*.jsx`
- [ ] `src/components/Meals/MealManagement.jsx`

**Comando para buscar:**

```bash
cd "c:\Users\JUANP\OneDrive\Desktop\RTVC PROGRAMACION"
grep -r "http://localhost:3000" src/
```

---

## 🆘 Troubleshooting

### Los números siguen mostrando "..."

**Verifica en la consola del navegador (DevTools móvil):**

```javascript
// Busca errores en la consola
Failed to fetch
ERR_CONNECTION_REFUSED
CORS error
```

**Solución:**
1. Verifica que el backend esté corriendo: `cd backend && npm run dev`
2. Verifica que Vite esté corriendo: `npm run dev`
3. Limpia el cache del navegador

### Error 404 en las peticiones

**Causa:** El proxy de Vite no está funcionando

**Verifica `vite.config.js`:**

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
}
```

### Error CORS

**No debería ocurrir** con el proxy de Vite, pero si ocurre:

**Verifica `backend/server.js`:**

```javascript
app.use(cors({
  origin: '*',
  credentials: true
}));
```

---

## 🎉 Resumen

**Problema:** URLs hardcodeadas con `localhost:3000` no funcionan desde el celular

**Solución:** Usar rutas relativas `/api/...` que Vite proxea automáticamente

**Archivos modificados:**
- [src/components/Dashboard/AdminDashboard.jsx](src/components/Dashboard/AdminDashboard.jsx) → 16 URLs corregidas

**Estado:** ✅ LISTO PARA PROBAR

---

**Última actualización:** 2026-01-19 16:25
