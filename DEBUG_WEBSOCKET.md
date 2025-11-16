# Guía de Debug - WebSocket de Tracking en Tiempo Real

## Problema Actual
El recolector se conecta mediante WebSocket pero su ubicación NO aparece en el mapa.

## Pasos para Debuggear

### 1. Abre el Panel de Debug
Cuando ingreses a `http://localhost:5173/admin/tracking`, verás un panel en la esquina inferior izquierda con:
- ✅ Estado de conexión (Conectado/Desconectado)
- 📊 Estadísticas en tiempo real
- 💡 Indicador de errores

### 2. Abre la Consola del Navegador
- **Windows/Linux:** Presiona `F12` → Ir a pestaña "Console"
- **Mac:** Presiona `Cmd + Option + I` → Ir a pestaña "Console"

### 3. Busca los Logs del WebSocket
En la consola verás logs como estos (búscalos):

```
[AdminWebSocket] Intentando conectar a: ws://innovahack.onrender.com/ws/admin/tu-admin-id
[AdminWebSocket] ✅ Conectado exitosamente
[AdminWebSocket] 📨 Mensaje recibido: {...}
[AdminWebSocket] 👥 Usuarios activos recibidos: 1
  - Agustin Apaza (123): -17.779723, -63.192147
[AdminWebSocket] 📍 Actualización de ubicación: Agustin Apaza -17.779723 -63.192147
```

## Diagnóstico Posibles Problemas

### ❌ "Desconectado" en el Panel
**Posible Causa:** El servidor WebSocket no está activo o la URL es incorrecta

**Soluciones:**
1. Verifica que `innovahack.onrender.com` esté disponible
2. Prueba con `ws://` en lugar de `wss://` (si el servidor no usa SSL)
3. Asegúrate de que el `admin_id` sea correcto

### ❌ "Conectado" pero sin usuarios
**Posible Causa:** El servidor conectó pero no está enviando datos

**Soluciones:**
1. En la consola, busca si dice: `[AdminWebSocket] 📨 Mensaje recibido`
2. Si no ves este mensaje → El servidor no está enviando nada
3. Verifica que el recolector haya presionado "Iniciar Recolección"

### ❌ "Conectado" con usuarios pero sin marcadores en el mapa
**Posible Causa:** Los datos se reciben pero no se renderizan

**Soluciones:**
1. En la consola, busca: `[AdminWebSocket] 👥 Usuarios activos recibidos`
2. Si dice "0" usuarios → No hay datos
3. Si dice "1" o más → Los datos se reciben pero hay error de renderizado

## Verificar Estructura de Datos

En la consola, ejecuta:
```javascript
// Verifica el estado del hook
console.log('Estado de usuarios:', window.lastUsers);
console.log('Estado conectado:', window.lastConnected);
```

## URL de Prueba

Para conectarte como admin, usa:
```
http://localhost:5173/admin/tracking
```

Ingresa un ID de admin (puede ser cualquier ID, ej: "admin123")

## Logs Esperados al Iniciar Recolección

Cuando el recolector presione "Iniciar Recolección", deberías ver:

```
[AdminWebSocket] 📨 Mensaje recibido: {
  "type": "location_update",
  "user_id": "123",
  "name": "Agustin Apaza",
  "lat": -17.779723,
  "lng": -63.192147,
  "route_id": "789",
  "timestamp": "2025-11-15T10:30:15"
}
```

Si NO ves este mensaje, significa que:
1. El recolector NO está enviando la ubicación
2. El servidor NO la está reenviando al admin
3. Hay un error en la app móvil

## Próximos Pasos

Una vez que veas los logs correctos:
1. Confirma que el usuario aparece en el panel lateral
2. El marcador en el mapa debería aparecer automáticamente
3. Si aún no aparece, hay error en react-leaflet

## Información para Reportar Error

Si tienes problemas, proporciona:
1. ¿Qué dice en el panel de debug? (Conectado/Desconectado)
2. ¿Qué ves en la consola al conectarte?
3. ¿Qué ves en la consola cuando el recolector inicia?
4. ¿El panel lateral muestra usuarios?
