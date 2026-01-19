# ✅ Fix Login desde Móvil - SOLUCIONADO

## 🔧 Cambios Realizados

### 1. Configuración Centralizada de API
**Archivo creado:** [src/config/api.js](src/config/api.js)

**¿Qué hace?**
- Detecta automáticamente si está en desarrollo o producción
- En desarrollo: usa rutas relativas `/api` que Vite proxea automáticamente
- Funciona tanto en `localhost` como en IP de red (`192.168.1.26`)
- Helper `apiFetch` con manejo automático de tokens

**Código:**
```javascript
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://api.rtvc.app';
  }
  // En desarrollo: ruta relativa → Vite la proxea
  return '/api';
};
```

### 2. Login Corregido
**Archivo:** [src/components/Auth/LoginPage.jsx](src/components/Auth/LoginPage.jsx)

**Antes:**
```javascript
fetch('http://localhost:3000/api/auth/login', ...)  // ❌ No funciona con IP
```

**Después:**
```javascript
import { apiFetch } from '../../config/api';
apiFetch('/auth/login', ...)  // ✅ Funciona en localhost Y en red
```

### 3. Logout Corregido
**Archivo:** [src/App.jsx](src/App.jsx)

**Antes:**
```javascript
fetch('http://localhost:3000/api/auth/logout', ...)  // ❌
```

**Después:**
```javascript
fetch('/api/auth/logout', ...)  // ✅ Ruta relativa
```

### 4. Proxy de Vite Mejorado
**Archivo:** [vite.config.js](vite.config.js)

**Mejoras:**
- Logs de debugging para ver qué se está proxeando
- Funciona con localhost Y con IP de red
- Manejo de errores mejorado

---

## 🚀 Cómo Probar

### 1. Reiniciar AMBOS servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Debe mostrar:
```
✅ Servidor HTTP corriendo en puerto 3000
🌐 Accesible en:
   - Local:   http://localhost:3000
   - Network: http://[TU_IP]:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Debe mostrar:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.26:5173/
```

### 2. Desde el celular

1. Abre Chrome
2. Ve a: **http://192.168.1.26:5173**
3. Espera a que cargue el Login
4. Usa las credenciales de prueba:
   - Usuario: `admin`
   - Contraseña: `admin123`
5. Click en "Iniciar Sesión"

**Debe funcionar ahora! ✅**

---

## 🔍 Verificar en la Consola

En Chrome Remote Debugging (chrome://inspect#devices), debes ver:

```
[Login] Intentando iniciar sesión...
[Proxy] POST /api/auth/login → http://localhost:3000
[Login] Login exitoso: { username: 'admin', ... }
```

Si ves `[SW] Modo: DESARROLLO`, el Service Worker NO está bloqueando nada.

---

## 📊 Flujo de la Petición

```
Celular (192.168.1.26:5173)
         ↓
    apiFetch('/auth/login')
         ↓
    fetch('/api/auth/login')  [Ruta relativa]
         ↓
    Vite Proxy intercepta
         ↓
    Redirige a localhost:3000/api/auth/login
         ↓
    Backend responde con token
         ↓
    Token guardado en localStorage
         ↓
    Redirect a Dashboard ✅
```

---

## 🛠️ Troubleshooting

### "Failed to fetch" persiste

**1. Verificar que el backend está corriendo:**
```bash
# Desde tu PC
curl http://localhost:3000/api/auth/login

# Debe responder (aunque sea con error 400)
```

**2. Verificar proxy de Vite:**

En la terminal del frontend, busca estas líneas cuando haces login:
```
[Proxy] POST /api/auth/login → http://localhost:3000
```

Si NO aparecen, el proxy no está funcionando.

**3. Verificar logs del Service Worker:**

En el celular (DevTools), debe decir:
```
[SW] Modo: DESARROLLO
```

Si dice `PRODUCCIÓN`, limpia el cache y recarga.

### "CORS Error"

El backend ya tiene CORS configurado, pero verifica:

```javascript
// backend/server.js
app.use(cors({
  origin: '*', // Permitir todos los orígenes en desarrollo
  credentials: true
}));
```

### Petición tarda mucho

Es normal la primera vez. El proxy de Vite puede tardar ~2 segundos.

---

## 📝 Próximos Archivos a Corregir

Aún hay archivos con URLs hardcodeadas que necesitan corrección:

- [ ] `src/hooks/useRealtimeSync.js`
- [ ] `src/components/Dashboard/*.jsx`
- [ ] `src/components/Assignments/*.jsx`
- [ ] `src/components/Meals/MealManagement.jsx`

**Solución:** Importar y usar `apiFetch` de `src/config/api.js`

---

## 🎯 Resultado Esperado

Una vez que funcione el login:

1. ✅ Verás el Dashboard de RTVC
2. ✅ El sidebar funcionará
3. ✅ Podrás navegar por todas las secciones
4. ✅ El botón "Instalar App RTVC" aparecerá (si aún no está instalada)

---

## 🔄 Si necesitas cambiar la IP del backend

Si tu backend está en otra máquina:

```bash
# Set environment variable
export BACKEND_URL=http://192.168.1.X:3000

# Luego reinicia Vite
npm run dev
```

---

¡El login desde el celular ahora debería funcionar perfectamente! 🎉
