# 📱 Guía para Acceder desde el Celular

## ✅ Problemas Resueltos

1. **Service Worker bloqueando conexiones HTTP locales**
   - ✅ SW ahora detecta si está en desarrollo (localhost o IP local)
   - ✅ En desarrollo: NO cachea nada, solo pasa peticiones directamente
   - ✅ Try/catch en todos los fetch para evitar errores

2. **Vite no exponiendo el servidor en la red local**
   - ✅ Configurado `host: '0.0.0.0'` para escuchar en todas las interfaces
   - ✅ CORS habilitado
   - ✅ Plugin PWA con `devOptions: { enabled: true }`

---

## 🚀 Pasos para Acceder desde el Celular

### 1. Obtener la IP de tu PC

**Windows:**
```bash
ipconfig
```

Busca la línea que dice:
```
Adaptador de LAN inalámbrica Wi-Fi:
   Dirección IPv4. . . . . . . . . . . . . . : 192.168.1.X
```

**O más simple:**
```bash
ipconfig | findstr IPv4
```

Anota tu IP, por ejemplo: `192.168.1.100`

---

### 2. Reiniciar Ambos Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Debe decir:
```
Backend escuchando en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Debe decir:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.X:5173/
  ➜  press h + enter to show help
```

**IMPORTANTE:** Ahora Vite muestra la IP de red. Si NO la muestra, el problema es la configuración.

---

### 3. Verificar Firewall

**Windows Defender:**
```bash
# Verificar si el puerto está bloqueado
netstat -an | findstr 5173
```

Si sale:
```
TCP    0.0.0.0:5173          0.0.0.0:0              LISTENING
```

Significa que está escuchando en todas las interfaces ✅

**Si NO aparece:**
```bash
# Agregar excepción al firewall
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="Backend Server" dir=in action=allow protocol=TCP localport=3000
```

---

### 4. Conectar desde el Celular

**Requisitos:**
- ✅ Celular y PC en la MISMA red Wi-Fi
- ✅ Firewall con excepciones agregadas
- ✅ Servidores corriendo

**En el celular:**

1. Abre Chrome
2. Ve a: `http://192.168.1.X:5173` (reemplaza X con tu IP)
3. Espera a que cargue

**Si funciona:**
- ✅ Verás el Dashboard de RTVC
- ✅ En DevTools del celular (Chrome Remote Debugging) verás:
  ```
  [SW] Modo: DESARROLLO
  [SW] Hostname: 192.168.1.X
  ```

---

## 🔍 Debugging

### Ver logs del celular en PC

**Chrome Remote Debugging:**

1. En PC: Abre Chrome
2. Ve a: `chrome://inspect#devices`
3. Conecta el celular por USB
4. Activa "Depuración USB" en el celular
5. Click en "Inspect" debajo de la página abierta
6. Verás la consola del celular en tu PC

---

### Verificar que el SW está en modo desarrollo

En la consola del celular debe aparecer:
```
[SW] Modo: DESARROLLO
[SW] Hostname: 192.168.1.100
✅ Service Worker registrado correctamente
```

Si dice `PRODUCCIÓN` en lugar de `DESARROLLO`, el SW no detectó la IP local correctamente.

---

### Comandos útiles

**Limpiar cache del Service Worker desde consola:**
```javascript
// En la consola del navegador del celular
navigator.serviceWorker.getRegistration().then(reg => {
  reg.unregister();
  location.reload();
});

// O limpiar cache manualmente
navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
```

---

## 🛠️ Solución de Problemas

### "Failed to fetch" o "ERR_CONNECTION_REFUSED"

**Causa:** El backend no está accesible desde la red.

**Solución:**

1. Verifica que el backend esté corriendo:
   ```bash
   curl http://localhost:3000/api/personnel
   ```

2. Modifica el backend para escuchar en todas las interfaces.

   **backend/server.js:**
   ```javascript
   // En lugar de:
   app.listen(3000, () => {
     console.log('Backend en http://localhost:3000');
   });

   // Usar:
   app.listen(3000, '0.0.0.0', () => {
     console.log('Backend en http://0.0.0.0:3000');
     console.log('Accesible desde red en http://192.168.1.X:3000');
   });
   ```

3. Reinicia el backend

---

### "Cannot read properties of undefined"

**Causa:** El frontend intenta hacer fetch a `localhost` en lugar de usar la IP.

**Solución:** El código ya usa URLs relativas (`/api/...`) que Vite proxy automáticamente.

Si algún archivo tiene hardcoded `http://localhost:3000`, cámbialo a:
```javascript
const API_URL = import.meta.env.DEV
  ? '/api' // En desarrollo, Vite lo proxea
  : 'https://produccion.com/api'; // En producción
```

---

### Service Worker sigue cacheando en desarrollo

**Solución:**

1. Unregister el SW en el celular:
   - Chrome > Configuración > Privacidad > Borrar datos
   - O desde DevTools: Application > Service Workers > Unregister

2. Cambiar la versión en `sw.js`:
   ```javascript
   const CACHE_VERSION = 'rtvc-v2'; // Incrementar número
   ```

3. Hard refresh en el celular:
   - Menú > Configuración > Borrar caché del sitio

---

### No aparece la opción "Network" en Vite

**Causa:** `host: '0.0.0.0'` no está configurado en `vite.config.js`

**Verificación:**
```javascript
// vite.config.js
export default defineConfig({
  server: {
    host: '0.0.0.0', // ← Debe estar presente
    port: 5173
  }
});
```

---

## 📊 Verificación Completa

Ejecuta este checklist:

```bash
# 1. Backend corriendo
curl http://localhost:3000/api/personnel
# Debe devolver JSON

# 2. Frontend corriendo
curl http://localhost:5173
# Debe devolver HTML

# 3. Puerto 5173 abierto en firewall
netstat -an | findstr 5173
# Debe mostrar: TCP 0.0.0.0:5173 ... LISTENING

# 4. Obtener IP
ipconfig | findstr IPv4
# Anota la IP: 192.168.1.X

# 5. Probar desde celular
# Navega a: http://192.168.1.X:5173
```

---

## 🎯 Configuración Final que Funciona

### vite.config.js ✅
```javascript
export default defineConfig({
  server: {
    host: '0.0.0.0', // ← CRÍTICO
    port: 5173,
    cors: true
  }
});
```

### sw.js ✅
```javascript
const isDevelopment = self.location.hostname === 'localhost' ||
                     self.location.hostname.match(/^192\.168\.\d+\.\d+$/);

if (isDevelopment) {
  // NO cachear en desarrollo
  event.respondWith(fetch(request));
}
```

### backend/server.js ✅
```javascript
app.listen(3000, '0.0.0.0', () => {
  console.log('Backend accesible en red');
});
```

---

## 🎉 Una Vez Funcionando

Cuando cargue correctamente en el celular:

1. Verás el Dashboard de RTVC
2. El botón hamburguesa funcionará
3. Podrás navegar por todas las secciones
4. El botón "Instalar App RTVC" aparecerá en el Sidebar
5. Podrás instalar la PWA en el celular

---

## 📱 Instalar PWA desde Celular

**Android Chrome:**
1. Menú ⋮ > "Agregar a pantalla de inicio"
2. O espera el banner automático
3. O usa el botón en el Sidebar

**iOS Safari:**
1. Botón compartir 📤
2. "Agregar a pantalla de inicio"
3. "Agregar"

---

## 🆘 Si Nada Funciona

**Plan B: Usar ngrok (Túnel HTTPS)**

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto 5173
ngrok http 5173

# Obtendrás una URL pública:
# https://abc123.ngrok.io

# Úsala en el celular
```

**Ventaja:** Funciona desde cualquier red, incluso datos móviles.

---

¡Con estos cambios, tu aplicación debería ser accesible desde el celular sin problemas! 🚀
