import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert as MuiAlert,
} from '@mui/material';

interface EditVolumeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (nuevoVolumen: string) => Promise<void>;
  nombreRecogedor: string;
  volumenActual: string;
}

export default function EditVolumeModal({
  open,
  onClose,
  onSave,
  nombreRecogedor,
  volumenActual,
}: EditVolumeModalProps) {
  const [volumen, setVolumen] = useState(volumenActual);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    
    // Validar que el volumen sea un número válido
    const numeroVolumen = parseInt(volumen.replace('%', ''));
    if (isNaN(numeroVolumen) || numeroVolumen < 0 || numeroVolumen > 100) {
      setError('El volumen debe ser un número entre 0 y 100');
      return;
    }

    const volumenFormato = `${numeroVolumen}%`;

    setLoading(true);
    try {
      await onSave(volumenFormato);
      handleClose();
    } catch (err) {
      console.error('Error saving volume:', err);
      setError('Error al actualizar el volumen');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVolumen(volumenActual);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '18px' }}>
        Editar Volumen
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {error && <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              Recogedor
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
              {nombreRecogedor}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              Volumen Porcentual
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                type="number"
                value={volumen.replace('%', '')}
                onChange={(e) => setVolumen(e.target.value)}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 1,
                }}
                disabled={loading}
                placeholder="0-100"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '14px',
                  },
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                %
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              Volumen Actual
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                color: '#10b981',
                fontSize: '18px',
              }}
            >
              {volumenActual}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ minWidth: '100px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
