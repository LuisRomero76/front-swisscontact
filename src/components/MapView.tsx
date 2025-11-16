import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Tooltip, useMap, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { fetchRoutesFromApi, fetchRoutesRaw, routeColors, convertCoordinates, type ApiRoute } from '@/data/routesData';
import { trackingService, type ActiveUser } from '@/services/trackingService';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Icono personalizado para usuarios activos
const userIcon = L.icon({
  iconUrl: '/ubicacion-removebg-preview.png',
  iconRetinaUrl: '/ubicacion-removebg-preview.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [41, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to fit bounds
function FitBounds({ routes }: { routes: [number, number][][] }) {
  const map = useMap();
  
  useEffect(() => {
    if (routes.length > 0) {
      const allCoords = routes.flat();
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, routes]);

  return null;
}

export default function MapView() {
  const [routes, setRoutes] = useState<[number, number][][]>([]);
  const [routeNames, setRouteNames] = useState<string[]>([]);
  const [routeColors, setRouteColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<Map<string, ActiveUser>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // Cargar rutas
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    Promise.all([fetchRoutesFromApi(), fetchRoutesRaw()])
      .then(([geojson, rawRoutes]) => {
        if (!mounted) return;
        
        // Obtener coordenadas de geojson
        const r = geojson.features.map((feature) =>
          convertCoordinates(feature.geometry.coordinates as number[][])
        );
        setRoutes(r);
        
        // Obtener nombres y colores según estado de asignación
        const names = rawRoutes.map((route: ApiRoute) => route.name);
        const colors = rawRoutes.map((route: ApiRoute) => route.assigned ? '#001effff' : '#ff0d0dff');
        
        setRouteNames(names);
        setRouteColors(colors);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError(String(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Conectar a tracking
  useEffect(() => {
    const handleLocationUpdate = (location: ActiveUser) => {
      setActiveUsers((prev) => {
        const updated = new Map(prev);
        updated.set(location.user_id, location);
        return updated;
      });
    };

    const handleConnected = () => {
      setConnectionStatus('connected');
    };

    trackingService
      .connect(handleLocationUpdate, handleConnected)
      .catch((err) => {
        console.error('Error conectando al servidor:', err);
        setConnectionStatus('disconnected');
      });

    return () => {
      // No desconectar aquí para mantener la conexión activa
    };
  }, []);

  const centerPosition: LatLngExpression = [-17.7800, -63.1800];

  if (loading) {
    return <div>Cargando rutas...</div>;
  }

  if (error) {
    return <div>Error cargando rutas: {error}</div>;
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Indicador de conexión */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        backgroundColor: connectionStatus === 'connected' ? '#10b981' : connectionStatus === 'connecting' ? '#f59e0b' : '#ef4444',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'white',
          display: 'inline-block',
          animation: connectionStatus === 'connecting' ? 'pulse 2s infinite' : 'none'
        }}></span>
        {connectionStatus === 'connected' ? '✅ Conectado' : connectionStatus === 'connecting' ? '⏳ Conectando...' : '❌ Desconectado'}
      </div>

      <MapContainer
        center={centerPosition}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        {...{ zoomControl: true } as any}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          {...{ attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } as any}
        />

        {/* Rutas */}
        {routes.map((route, index) => {
          const color = routeColors[index];
          const routeName = routeNames[index] || `Ruta ${index + 1}`;
          return (
            <Polyline
              key={index}
              positions={route}
              pathOptions={{
                color: color,
                weight: 6,
                opacity: 0.8,
              }}
            >
              <Tooltip {...{ permanent: true } as any} direction="center" className="route-tooltip">
                {routeName}
              </Tooltip>
            </Polyline>
          );
        })}

        {/* Marcadores de usuarios activos */}
        {Array.from(activeUsers.values()).map((user) => (
          <Marker
            key={user.user_id}
            position={[user.lat, user.lng]}
            {...{ icon: userIcon } as any}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>{user.name}</strong>
                <br />
                <small>Lat: {user.lat.toFixed(6)}</small>
                <br />
                <small>Lng: {user.lng.toFixed(6)}</small>
                {user.route_id && (
                  <>
                    <br />
                    <small>Ruta: {user.route_id}</small>
                  </>
                )}
                <br />
                <small>🕐 {new Date(user.last_update).toLocaleTimeString()}</small>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds routes={routes} />
      </MapContainer>

      {/* Leyenda */}
      <div className="leyenda">
        <h4>Microrutas</h4>
        {routes.map((_, index) => {
          const color = routeColors[index];
          const routeName = routeNames[index] || `Ruta ${index + 1}`;
          const isAssigned = color === '#0014f3ff';
          return (
            <div key={index} className="item-leyenda">
              <div style={{ backgroundColor: color }}></div>
              <span>{routeName} {isAssigned ? '' : ''}</span>
            </div>
          );
        })}
        <hr style={{ margin: '10px 0', borderColor: '#ddd' }} />
        <div>
          <strong style={{ fontSize: '12px' }}>Usuarios Activos: {activeUsers.size}</strong>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
