import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert as MuiAlert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchAlerts, deleteAlert, formatAlertDate, type Alert } from '@/services/alertsService';

interface AlertsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AlertsModal({ open, onClose }: AlertsModalProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadAlerts();
    }
  }, [open]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    setDeletingId(alertId);
    try {
      const success = await deleteAlert(alertId);
      if (success) {
        // Eliminar la alerta de la lista local
        setAlerts(alerts.filter(alert => alert._id !== alertId));
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth >
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '18px' }}>
        Alertas ({alerts.length})
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : alerts.length === 0 ? (
          <MuiAlert severity="success">No hay alertas en este momento</MuiAlert>
        ) : (
          <List sx={{ width: '100%' }}>
            {alerts.map((alert, index) => (
              <ListItem
                key={alert._id}
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: '#fff3cd',
                  borderLeft: '4px solid #ff9800',
                  borderRadius: 1,
                  display: 'block',
                  position: 'relative',
                }}
              >
                {/* Botón de eliminar en la esquina superior derecha */}
                <IconButton
                  size="small"
                  onClick={() => handleDeleteAlert(alert._id)}
                  disabled={deletingId === alert._id}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#d32f2f',
                    '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>

                {/* Indicador de secuencia */}
                <Chip
                  label={`Alerta #${alerts.length - index}`}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />

                {/* Usuario */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {alert.name_user}
                  </Typography>
                </Box>

                {/* Ruta */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#1976d2' }}>
                    <strong>Ruta:</strong> {alert.route_name}
                  </Typography>
                </Box>

                {/* Mensaje */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    <strong>Mensaje:</strong> {alert.message}
                  </Typography>
                </Box>

                {/* Fecha */}
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {formatAlertDate(alert.date)}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={loadAlerts} color="primary" variant="outlined" size="small">
          🔄 Actualizar
        </Button>
        <Button onClick={onClose} color="primary" variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
