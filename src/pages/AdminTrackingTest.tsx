import { useState } from 'react';
import { Box, Container, TextField, Button, Alert, Typography, Paper, Card, CardContent } from '@mui/material';

export default function AdminTrackingTestPage() {
  const [adminId, setAdminId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleConnect = () => {
    if (inputValue.trim()) {
      setAdminId(inputValue);
      setIsConnected(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 3, textAlign: 'center' }}>
          Dashboard de Tracking
        </Typography>

        <Card sx={{ mb: 3, bgcolor: 'hsl(var(--muted))' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ingresa tu ID de administrador para conectarte al sistema de tracking en tiempo real.
            </Typography>

            <TextField
              fullWidth
              label="ID de Administrador"
              placeholder="Ej: admin123 o 6918c21792cd6492dbd79515"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
              disabled={isConnected}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleConnect}
              disabled={!inputValue.trim() || isConnected}
              sx={{ bgcolor: 'hsl(var(--primary))', textTransform: 'none', fontSize: '1rem' }}
            >
              Conectar
            </Button>
          </CardContent>
        </Card>

        <Alert severity="info">
          <Typography variant="body2">
            <strong>Nota:</strong> El dashboard se conectará a través de WebSocket al endpoint:
            <br />
            <code>ws://innovahack.onrender.com/ws/admin/{'<admin_id>'}</code>
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
}
