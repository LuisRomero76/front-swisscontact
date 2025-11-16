import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
  Alert as MuiAlert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { fetchAlerts, formatAlertDate, type Alert } from '@/services/alertsService';
import { alertsWebSocketService, type AlertNotification } from '@/services/alertsWebSocketService';

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [newAlertCount, setNewAlertCount] = useState(0);

  useEffect(() => {
    // Cargar alertas iniciales
    loadDashboardData();

    // Solicitar permiso para notificaciones del navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Conectar al WebSocket
    const connectToWebSocket = async () => {
      try {
        const handleAlertMessage = (notification: AlertNotification) => {
          console.log('Nueva alerta recibida:', notification);
          setWsConnected(true);
          setNewAlertCount((prev) => prev + 1);

          // Procesar la alerta recibida
          if (notification.alert) {
            const newAlert: Alert = notification.alert;

            // Agregar la nueva alerta al inicio de la lista
            setAlerts((prevAlerts) => {
              const updatedAlerts = [newAlert, ...prevAlerts];
              // Ordenar alertas por fecha (más antigua primero)
              return updatedAlerts.sort((a, b) => {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
              });
            });

            // Notificación del navegador si está disponible
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nueva Alerta', {
                body: `${newAlert.name_user}: ${newAlert.message}`,
                icon: '/ubicacion-removebg-preview.png',
              });
            }

            // Reproducir sonido de notificación
            playNotificationSound();
          }
        };

        alertsWebSocketService.onMessage(handleAlertMessage);
        await alertsWebSocketService.connect(handleAlertMessage);
        setWsConnected(true);
        setError(null);
      } catch (err) {
        console.error('Error conectando al WebSocket de alertas:', err);
        setWsConnected(false);
        setError('Error conectando a alertas en tiempo real');
      }
    };

    connectToWebSocket();

    return () => {
      alertsWebSocketService.disconnect();
    };
  }, []);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.log('No se pudo reproducir sonido de notificación:', err);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const alertsData = await fetchAlerts();
      // Ordenar alertas de menor a mayor (por fecha más antigua primero)
      const sortedAlerts = alertsData.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      setAlerts(sortedAlerts);
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, width: '47%', height: '350px', overflow: 'auto' }}>
      {/* Card de Alertas */}
      <Card
        sx={{
          boxShadow: 3,
          borderTop: '4px solid #ff9800',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <CardHeader
          avatar={<ErrorOutlineIcon sx={{ color: '#ff9800', fontSize: 32 }} />}
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                Alertas del Sistema
              </Typography>
              <Chip
                label={wsConnected ? 'En Vivo' : 'Desconectado'}
                size="small"
                variant="outlined"
                sx={{
                  bgcolor: wsConnected ? '#e8f5e9' : '#ffebee',
                  color: wsConnected ? '#2e7d32' : '#c62828',
                  border: `1px solid ${wsConnected ? '#4caf50' : '#f44336'}`,
                  fontWeight: 'bold',
                }}
              />
            </Box>
          }
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {alerts.length} alertas registradas
              </Typography>
              {newAlertCount > 0 && (
                <Chip
                  label={`+${newAlertCount} nuevas`}
                  size="small"
                  variant="filled"
                  sx={{
                    bgcolor: '#ff9800',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              )}
            </Box>
          }
          sx={{ bgcolor: '#fafafa', pb: 1 }}
        />
        <CardContent>
          {error && <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert>}

          {alerts.length === 0 ? (
            <MuiAlert severity="success">No hay alertas en este momento</MuiAlert>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 0, border: '1px solid #e0e0e0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Ruta</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Mensaje</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Fecha y Hora</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.map((alert, index) => (
                    <TableRow
                      key={alert._id}
                      sx={{
                        '&:hover': { bgcolor: '#f9f9f9' },
                        borderBottom: '1px solid #e0e0e0',
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          variant="outlined"
                          sx={{ minWidth: 40 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {alert.name_user}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#1976d2' }}>
                          {alert.route_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#d32f2f',
                            fontWeight: 500,
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {alert.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {formatAlertDate(alert.date)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
