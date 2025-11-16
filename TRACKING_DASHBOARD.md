# Dashboard de Tracking en Tiempo Real para Admins

## Descripción

Dashboard interactivo que permite a los administradores visualizar la ubicación en tiempo real de todos los recolectores activos en el mapa.

## Características Principales

### 1. **Conexión WebSocket en Tiempo Real**
- Conecta automáticamente al endpoint: `ws://innovahack.onrender.com/ws/admin/{admin_id}`
- Maneja reconexión automática (hasta 5 intentos)
- Sincronización de datos en vivo

### 2. **Mapa Interactivo**
- Muestra marcadores para cada recolector activo
- Colores diferentes según estado:
  - 🟢 Verde: En línea
  - 🟠 Naranja: Pausado
  - 🔴 Rojo: Offline
- Al hacer click en un marcador:
  - Muestra nombre del recolector
  - Coordenadas precisas (lat/lng)
  - Ruta asignada
  - Última actualización

### 3. **Panel Lateral con Información**
- **Estadísticas en tiempo real:**
  - Total de recolectores activos
  - Cantidad de actualizaciones recibidas
  - Estado de conexión

- **Filtros avanzados:**
  - Búsqueda por nombre de recolector
  - Filtro por ruta
  - Filtro por estado (activo, pausado, offline)

- **Lista de recolectores:**
  - Información completa de cada recolector
  - Estado visual con chip de color
  - Coordenadas y timestamps

### 4. **Visualización de Rutas**
- Al seleccionar un recolector, muestra su ruta asignada en el mapa
- La ruta se dibuja como una línea punteada azul
- Permite seguimiento visual del recorrido

## Estructura de Archivos

```
src/
├── hooks/
│   └── useAdminWebSocket.ts          # Custom hook para WebSocket
├── components/
│   ├── AdminTrackingDashboard.tsx    # Dashboard principal
│   └── TrackingPanel.tsx             # Panel lateral con filtros
└── pages/
    └── AdminDashboard.tsx            # Página del dashboard
```

## Uso

### 1. Importar el componente

```tsx
import AdminTrackingDashboard from '@/components/AdminTrackingDashboard';

export default function MyPage() {
  const adminId = 'mi-admin-id'; // Obtener del contexto/state
  
  return <AdminTrackingDashboard adminId={adminId} />;
}
```

### 2. O usar la página completa

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboardPage from '@/pages/AdminDashboard';

// En tus rutas:
<Route path="/admin/dashboard/:adminId" element={<AdminDashboardPage />} />
```

## Tipos de Datos

### TrackedUser
```typescript
interface TrackedUser {
  user_id: string;
  name: string;
  lat: number;
  lng: number;
  route_id: string;
  last_update: string;
  status?: 'active' | 'paused' | 'offline';
}
```

### WebSocket Messages

**Conexión inicial:**
```json
{
  "type": "active_users",
  "users": [...],
  "count": 5
}
```

**Actualización de ubicación:**
```json
{
  "type": "location_update",
  "user_id": "123",
  "name": "Agustin Apaza",
  "lat": -17.779723,
  "lng": -63.192147,
  "route_id": "789",
  "timestamp": "2025-11-15T10:30:15"
}
```

**Conexión/Desconexión:**
```json
{
  "type": "user_connected",
  "user_id": "123",
  "name": "Agustin",
  "timestamp": "..."
}
```

```json
{
  "type": "user_disconnected",
  "user_id": "123",
  "name": "Agustin",
  "timestamp": "..."
}
```

## Custom Hook: useAdminWebSocket

```typescript
const { users, connected, error, stats } = useAdminWebSocket(adminId);

// users: TrackedUser[] - Array de usuarios activos
// connected: boolean - Estado de conexión
// error: string | null - Mensaje de error si hay
// stats: {
//   totalActive: number;
//   lastUpdate: Date;
//   updatesReceived: number;
// }
```

## Optimizaciones Implementadas

- **React.memo** en componentes que no necesitan re-render frecuente
- **useMemo** para filtros y búsquedas
- **Callbacks memoizados** con useCallback
- **Lazy rendering** de marcadores
- **Manejo eficiente de estado** del mapa

## Reconexión Automática

El hook `useAdminWebSocket` implementa:
- Reconexión automática hasta 5 intentos
- Delay creciente entre intentos (3000ms × número de intento)
- Log de intentos en consola
- Notificaciones de error al usuario

## Escalabilidad

- Soporta múltiples recolectores sin performance issues
- Mapa se centra automáticamente en nuevos usuarios
- Filtros optimizados para listas grandes
- Estado global gestionado eficientemente

## Próximas Mejoras Sugeridas

1. **Historial de ubicaciones**
   - Mostrar trail/camino recorrido del recolector

2. **Alertas de desviación**
   - Notificar si un recolector se desvía de su ruta

3. **Exportar datos**
   - Generar reportes en PDF/CSV del tracking

4. **Geofencing**
   - Definir zonas permitidas
   - Alertas de salida de zona

5. **Estadísticas avanzadas**
   - Velocidad promedio
   - Distancia recorrida
   - Tiempo en ruta
