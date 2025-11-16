import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
  Alert as MuiAlert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { fetchCompletedRoutes, formatDate, updateVolumePercentage, type CompletedRoute } from '@/services/completedRoutesService';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import EditVolumeModal from '@/components/EditVolumeModal';

export default function Completados() {
  const [completedRoutes, setCompletedRoutes] = useState<CompletedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ src: string; nombre: string }>({
    src: '',
    nombre: '',
  });
  const [total, setTotal] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditRoute, setSelectedEditRoute] = useState<CompletedRoute | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadCompletedRoutes();
  }, []);

  const loadCompletedRoutes = async () => {
    setLoading(true);
    try {
      const data = await fetchCompletedRoutes();
      setCompletedRoutes(data.rutas_completadas);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      console.error('Error loading completed routes:', err);
      setError('Error al cargar las rutas completadas');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (route: CompletedRoute) => {
    setSelectedImage({
      src: `data:image/png;base64,${route.foto_base64}`,
      nombre: route.nombre,
    });
    setImagePreviewOpen(true);
  };

  const handleCloseImagePreview = () => {
    setImagePreviewOpen(false);
    setSelectedImage({ src: '', nombre: '' });
  };

  const handleEditClick = (route: CompletedRoute) => {
    setSelectedEditRoute(route);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedEditRoute(null);
  };

  const handleSaveVolume = async (nuevoVolumen: string) => {
    if (!selectedEditRoute) return;

    setEditLoading(true);
    try {
      const updatedRoute = await updateVolumePercentage(
        selectedEditRoute._id,
        nuevoVolumen
      );

      // Actualizar la ruta en la lista local
      setCompletedRoutes(
        completedRoutes.map((route) =>
          route._id === selectedEditRoute._id
            ? { ...route, volumen_porcentual: updatedRoute.volumen_porcentual }
            : route
        )
      );

      setSuccessMessage(`Volumen actualizado a ${nuevoVolumen}`);
      handleCloseEditDialog();
    } catch (err) {
      console.error('Error saving volume:', err);
      setError('Error al actualizar el volumen');
    } finally {
      setEditLoading(false);
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
    <Box sx={{ p: 3, width: '100%', height: '100%', overflow: 'auto' }}>
      {/* Card Principal */}
      <Card
        sx={{
          boxShadow: 3,
          borderTop: '4px solid #10b981',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <CardHeader
          avatar={<TaskAltIcon sx={{ color: '#10b981', fontSize: 32 }} />}
          title={
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
              Rutas Completadas
            </Typography>
          }
          subheader={
            <Typography variant="body2" sx={{ color: '#666' }}>
              {total} ruta(s) completada(s)
            </Typography>
          }
          sx={{ bgcolor: '#fafafa', pb: 1 }}
        />
        <CardContent>
          {error && <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert>}

          {completedRoutes.length === 0 ? (
            <MuiAlert severity="info">No hay rutas completadas en este momento</MuiAlert>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 0, border: '1px solid #e0e0e0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333', width: '15%' }}>
                      Foto
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>
                      Recogedor
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>
                      Ruta
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333', width: '12%' }}>
                      Volumen
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333', width: '20%' }}>
                      Fecha y Hora
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333', width: '15%' }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedRoutes.map((route, index) => (
                    <TableRow
                      key={route._id}
                      sx={{
                        '&:hover': { bgcolor: '#f9f9f9' },
                        borderBottom: '1px solid #e0e0e0',
                      }}
                    >
                      {/* Columna de Foto */}
                      <TableCell sx={{ textAlign: 'center', py: 1 }}>
                        <Box
                          component="img"
                          src={`data:image/png;base64,${route.foto_base64}`}
                          alt={route.nombre}
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 1,
                            cursor: 'pointer',
                            objectFit: 'cover',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            },
                          }}
                          onClick={() => handleImageClick(route)}
                        />
                      </TableCell>

                      {/* Columna de Recogedor */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {route.nombre}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {route.ruta}
                        </Typography>
                      </TableCell>

                      {/* Columna de Volumen */}
                      <TableCell>
                        <Chip
                          label={route.volumen_porcentual}
                          size="small"
                          variant="filled"
                          sx={{
                            bgcolor: '#10b981',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>

                      {/* Columna de Fecha y Hora */}
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {formatDate(route.timestamp)}
                        </Typography>
                      </TableCell>

                      {/* Columna de Acciones */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleImageClick(route)}
                            sx={{
                              color: '#1976d2',
                              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' },
                            }}
                            title="Ver imagen"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(route)}
                            sx={{
                              color: '#ff9800',
                              '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.1)' },
                            }}
                            title="Editar volumen"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modal de Preview de Imagen */}
      <ImagePreviewModal
        open={imagePreviewOpen}
        onClose={handleCloseImagePreview}
        imageSrc={selectedImage.src}
        nombre={selectedImage.nombre}
      />

      {/* Modal de Edición de Volumen */}
      {selectedEditRoute && (
        <EditVolumeModal
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          onSave={handleSaveVolume}
          nombreRecogedor={selectedEditRoute.nombre}
          volumenActual={selectedEditRoute.volumen_porcentual}
        />
      )}

      {/* Snackbar para mensajes de éxito */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#10b981',
          },
        }}
      />
    </Box>
  );
}
