import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
  Alert as MuiAlert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StorageIcon from '@mui/icons-material/Storage';
import TimelineIcon from '@mui/icons-material/Timeline';
import { fetchCompletedRoutes, type CompletedRoute } from '@/services/completedRoutesService';

interface RouteData {
  nombre: string;
  volumen: number;
  completadas: number;
}

interface TimelineData {
  fecha: string;
  cantidad: number;
  volumenPromedio: number;
}

const COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

export default function CompletedRoutesDashboard() {
  const [completedRoutes, setCompletedRoutes] = useState<CompletedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await fetchCompletedRoutes();
      setCompletedRoutes(data.rutas_completadas);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Procesar datos para gráfica de barras (volumen por ruta)
  const getVolumeByRoute = (): RouteData[] => {
    const routeMap = new Map<string, { volumen: number; count: number }>();

    completedRoutes.forEach((route) => {
      const volumen = parseInt(route.volumen_porcentual || '0');
      const rutaNombre = route.ruta || 'Sin asignar';

      const existing = routeMap.get(rutaNombre) || { volumen: 0, count: 0 };
      routeMap.set(rutaNombre, {
        volumen: existing.volumen + volumen,
        count: existing.count + 1,
      });
    });

    return Array.from(routeMap.entries()).map(([nombre, data]) => ({
      nombre,
      volumen: Math.round(data.volumen / data.count), // Promedio
      completadas: data.count,
    }));
  };

  // Procesar datos para gráfica de pie (distribución de volumen)
  const getVolumeDistribution = (): RouteData[] => {
    const routeMap = new Map<string, number>();

    completedRoutes.forEach((route) => {
      const volumen = parseInt(route.volumen_porcentual || '0');
      const rutaNombre = route.ruta || 'Sin asignar';
      const existing = routeMap.get(rutaNombre) || 0;
      routeMap.set(rutaNombre, existing + volumen);
    });

    return Array.from(routeMap.entries()).map(([nombre, volumen]) => ({
      nombre,
      volumen,
      completadas: 0,
    }));
  };

  // Procesar datos para línea de tiempo
  const getTimelineData = (): TimelineData[] => {
    const timelineMap = new Map<string, { cantidad: number; volumenTotal: number }>();

    completedRoutes.forEach((route) => {
      const date = new Date(route.timestamp);
      const fechaKey = date.toLocaleDateString('es-ES');
      const volumen = parseInt(route.volumen_porcentual || '0');

      const existing = timelineMap.get(fechaKey) || { cantidad: 0, volumenTotal: 0 };
      timelineMap.set(fechaKey, {
        cantidad: existing.cantidad + 1,
        volumenTotal: existing.volumenTotal + volumen,
      });
    });

    return Array.from(timelineMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([fecha, data]) => ({
        fecha,
        cantidad: data.cantidad,
        volumenPromedio: Math.round(data.volumenTotal / data.cantidad),
      }));
  };

  // Procesar datos para recolectores
  const getCollectorStats = () => {
    const collectorMap = new Map<
      string,
      { cantidad: number; volumenPromedio: number; volumenTotal: number }
    >();

    completedRoutes.forEach((route) => {
      const volumen = parseInt(route.volumen_porcentual || '0');
      const nombre = route.nombre;

      const existing = collectorMap.get(nombre) || { cantidad: 0, volumenPromedio: 0, volumenTotal: 0 };
      collectorMap.set(nombre, {
        cantidad: existing.cantidad + 1,
        volumenTotal: existing.volumenTotal + volumen,
        volumenPromedio: 0,
      });
    });

    return Array.from(collectorMap.entries())
      .map(([nombre, data]) => ({
        nombre,
        cantidad: data.cantidad,
        volumenPromedio: Math.round(data.volumenTotal / data.cantidad),
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5); // Top 5
  };

  // Calcular métricas generales
  const calculateMetrics = () => {
    if (completedRoutes.length === 0) {
      return {
        totalCompletadas: 0,
        volumenPromedio: 0,
        volumenMax: 0,
        volumenMin: 100,
      };
    }

    const volumes = completedRoutes.map((r) => parseInt(r.volumen_porcentual || '0'));
    return {
      totalCompletadas: completedRoutes.length,
      volumenPromedio: Math.round(
        volumes.reduce((a, b) => a + b, 0) / volumes.length
      ),
      volumenMax: Math.max(...volumes),
      volumenMin: Math.min(...volumes),
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const volumeByRoute = getVolumeByRoute();
  const volumeDistribution = getVolumeDistribution();
  const timelineData = getTimelineData();
  const collectorStats = getCollectorStats();
  const metrics = calculateMetrics();

  return (
    <Box sx={{ p: 3, width: '100%', height: '100%', overflow: 'auto', bgcolor: '#f5f5f5' }}>
      {error && <MuiAlert severity="error" sx={{ mb: 3 }}>{error}</MuiAlert>}

      {/* Tarjetas de Métricas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card sx={{ boxShadow: 2, bgcolor: '#fff', border: '2px solid #10b981' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Completadas
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                  {metrics.totalCompletadas}
                </Typography>
              </Box>
              <LocalShippingIcon sx={{ fontSize: 48, color: '#10b981', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 2, bgcolor: '#fff', border: '2px solid #3b82f6' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Volumen Promedio
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3b82f6' }}>
                  {metrics.volumenPromedio}%
                </Typography>
              </Box>
              <StorageIcon sx={{ fontSize: 48, color: '#3b82f6', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 2, bgcolor: '#fff', border: '2px solid #f59e0b' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Volumen Máximo
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
                  {metrics.volumenMax}%
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 48, color: '#f59e0b', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 2, bgcolor: '#fff', border: '2px solid #ef4444' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Volumen Mínimo
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ef4444' }}>
                  {metrics.volumenMin}%
                </Typography>
              </Box>
              <TimelineIcon sx={{ fontSize: 48, color: '#ef4444', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Gráficas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Gráfica de Barras - Volumen por Ruta */}
        <Card sx={{ boxShadow: 3 }}>
          <CardHeader
            title="Volumen Promedio por Ruta"
            sx={{ bgcolor: '#f5f5f5', pb: 2 }}
          />
          <CardContent>
            {volumeByRoute.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={volumeByRoute}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    formatter={(value) => `${value}%`}
                  />
                  <Legend />
                  <Bar dataKey="volumen" fill="#10b981" name="Volumen %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary" align="center">
                No hay datos disponibles
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Gráfica de Pie - Distribución de Volumen */}
        <Card sx={{ boxShadow: 3 }}>
          <CardHeader
            title="Distribución de Volumen por Ruta"
            sx={{ bgcolor: '#f5f5f5', pb: 2 }}
          />
          <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
            {volumeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={volumeDistribution}
                    dataKey="volumen"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ nombre, volumen }) => `${nombre}: ${volumen}%`}
                  >
                    {volumeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary" align="center">
                No hay datos disponibles
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Gráfica de Línea - Timeline (Full Width) */}
        <Box sx={{ gridColumn: { xs: '1', lg: '1 / -1' } }}>
          <Card sx={{ boxShadow: 3 }}>
            <CardHeader
              title="Historial Diario - Rutas Completadas y Volumen Promedio"
              sx={{ bgcolor: '#f5f5f5', pb: 2 }}
            />
            <CardContent>
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    />
                    <Legend />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cantidad"
                      stroke="#3b82f6"
                      name="Cantidad Completadas"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="volumenPromedio"
                      stroke="#10b981"
                      name="Volumen Promedio %"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary" align="center">
                  No hay datos disponibles
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Top 5 Recolectores (Full Width) */}
        <Box sx={{ gridColumn: { xs: '1', lg: '1 / -1' } }}>
          <Card sx={{ boxShadow: 3 }}>
            <CardHeader
              title="Top 5 Recolectores por Rutas Completadas"
              sx={{ bgcolor: '#f5f5f5', pb: 2 }}
            />
            <CardContent>
              {collectorStats.length > 0 ? (
                <TableContainer component={Paper} sx={{ boxShadow: 0, border: '1px solid #e0e0e0' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>
                          Recogedor
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
                          Rutas Completadas
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
                          Volumen Promedio
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {collectorStats.map((collector, index) => (
                        <TableRow
                          key={collector.nombre}
                          sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={`#${index + 1}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  backgroundColor: COLORS[index % COLORS.length],
                                  color: 'white',
                                  borderColor: COLORS[index % COLORS.length],
                                }}
                              />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {collector.nombre}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={collector.cantidad}
                              size="small"
                              variant="filled"
                              sx={{ bgcolor: '#3b82f6', color: 'white', fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${collector.volumenPromedio}%`}
                              size="small"
                              variant="filled"
                              sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 'bold' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" align="center">
                  No hay datos disponibles
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
