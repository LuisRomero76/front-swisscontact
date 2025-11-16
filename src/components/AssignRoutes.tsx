import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  Typography,
  Container,
  Alert,
  IconButton,
} from '@mui/material';
import { Trash2 } from 'lucide-react';
import { fetchRoutesRaw, assignRoute, updateRouteAssignedStatus, type ApiRoute } from '@/data/routesData';
import { fetchUsersFromApi, fetchAssignmentsFromApi, deleteAssignmentFromApi, type ApiUser, type ApiAssignment } from '@/data/usersData';

interface Asignacion {
  userId: string;
  routeId: string | null; // _id de la ruta
  routeName: string | null; // Nombre de la ruta
}

export default function AssignRoutes() {
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [unassignedRoutes, setUnassignedRoutes] = useState<ApiRoute[]>([]);
  const [apiAssignments, setApiAssignments] = useState<ApiAssignment[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [errorRoutes, setErrorRoutes] = useState<string | null>(null);
  const [errorAssignments, setErrorAssignments] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estado para tracking de asignaciones (locales + completadas)
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [asignacionesCompletadas, setAsignacionesCompletadas] = useState<Asignacion[]>([]);

  // Selección temporal antes de asignar
  const [selecciones, setSelecciones] = useState<{ [key: string]: string }>({}); // userId -> routeId

  // Fetch users
  useEffect(() => {
    let mounted = true;
    setLoadingUsers(true);
    fetchUsersFromApi()
      .then((data) => {
        if (!mounted) return;
        // Filtrar solo usuarios con rol Recolector
        const recolectores = data.filter((u) => u.rol === 'Recolector');
        setUsers(recolectores);
        setAsignaciones(recolectores.map((u) => ({ userId: u._id, routeId: null, routeName: null })));
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        if (mounted) setErrorUsers(String(err));
      })
      .finally(() => {
        if (mounted) setLoadingUsers(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch routes
  useEffect(() => {
    let mounted = true;
    setLoadingRoutes(true);
    fetchRoutesRaw()
      .then((raw) => {
        if (!mounted) return;
        setRoutes(raw);
        // Filtrar solo rutas sin asignar
        const unassigned = raw.filter((r) => !r.assigned);
        setUnassignedRoutes(unassigned);
      })
      .catch((err) => {
        console.error('Error fetching routes for AssignRoutes:', err);
        if (mounted) setErrorRoutes(String(err));
      })
      .finally(() => {
        if (mounted) setLoadingRoutes(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch assignments from API
  useEffect(() => {
    let mounted = true;
    setLoadingAssignments(true);
    fetchAssignmentsFromApi()
      .then((assignments) => {
        if (!mounted) return;
        setApiAssignments(assignments);
      })
      .catch((err) => {
        console.error('Error fetching assignments:', err);
        if (mounted) setErrorAssignments(String(err));
      })
      .finally(() => {
        if (mounted) setLoadingAssignments(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectChange = (userId: string, routeId: string) => {
    setSelecciones((prev) => ({
      ...prev,
      [userId]: routeId,
    }));
  };

  const handleAsignar = async (userId: string) => {
    const routeId = selecciones[userId];
    if (!routeId) return;

    // Encontrar nombre de la ruta
    const route = routes.find((r) => r._id === routeId);
    const routeName = route?.name || 'Sin nombre';

    try {
      // Enviar al API
      await assignRoute(routeId, userId);

      // Actualizar estado local
      setAsignaciones((prev) =>
        prev.map((a) =>
          a.userId === userId ? { ...a, routeId, routeName } : a
        )
      );

      // Agregar a asignaciones completadas
      setAsignacionesCompletadas((prev) => [
        ...prev,
        { userId, routeId, routeName },
      ]);

      // Remover ruta de disponibles
      setUnassignedRoutes((prev) => prev.filter((r) => r._id !== routeId));

      // Limpiar selección
      setSelecciones((prev) => {
        const newSelecciones = { ...prev };
        delete newSelecciones[userId];
        return newSelecciones;
      });

      setSuccessMessage(`Ruta asignada exitosamente a ${users.find((u) => u._id === userId)?.name}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error assigning route:', err);
      alert(`Error al asignar ruta: ${err}`);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string, userId: string, routeId: string) => {
    if (!confirm('¿Estás seguro de que deseas quitar esta asignación?')) return;

    try {
      // Eliminar del API de asignaciones
      await deleteAssignmentFromApi(assignmentId);

      // Actualizar estado de la ruta a assigned: false
      await updateRouteAssignedStatus(routeId, false);

      // Eliminar de apiAssignments
      setApiAssignments((prev) => prev.filter((a) => a._id !== assignmentId));

      // Agregar ruta de vuelta a disponibles
      const route = routes.find((r) => r._id === routeId);
      if (route) {
        setUnassignedRoutes((prev) => {
          const exists = prev.find((r) => r._id === routeId);
          if (!exists) {
            return [...prev, { ...route, assigned: false }];
          }
          return prev;
        });
      }

      setSuccessMessage('Asignación eliminada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting assignment:', err);
      alert(`Error al eliminar asignación: ${err}`);
    }
  };

  const getAsignacionDeUsuario = (userId: string) => {
    const asignacion = asignaciones.find((a) => a.userId === userId);
    return asignacion?.routeName || '';
  };

  if (loadingUsers || loadingRoutes || loadingAssignments) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, height: '100%', overflow: 'auto' }}>
        <Typography>Cargando datos...</Typography>
      </Container>
    );
  }

  if (errorUsers || errorRoutes) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, height: '100%', overflow: 'auto' }}>
        <Typography color="error">Error: {errorUsers || errorRoutes}</Typography>
      </Container>
    );
  }

  const usuariosDisponibles = users.filter((u) => {
    // No mostrar si tiene asignación local
    const tieneAsignacionLocal = asignaciones.find((a) => a.userId === u._id && a.routeId !== null);
    if (tieneAsignacionLocal) return false;

    // No mostrar si tiene asignación en la API
    const tieneAsignacionAPI = apiAssignments.find((a) => a.user_id === u._id);
    if (tieneAsignacionAPI) return false;

    return true;
  });

  const usuariosConAsignacion = users.filter(
    (u) => asignaciones.find((a) => a.userId === u._id && a.routeId !== null)
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: '100%', overflow: 'auto' }}>
      <Typography variant="h4" gutterBottom fontWeight={600} color="hsl(var(--primary))">
        Asignar Rutas a Recolectores
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Typography variant="h5" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
        Recolectores por Asignar
      </Typography>

      <TableContainer component={Paper} elevation={2} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#dddfd3', '& th': { color: 'black', fontWeight: 600 } }}>
              <TableCell>Recolector</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Seleccionar Ruta</TableCell>
              <TableCell align="center">Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuariosDisponibles.map((user) => (
              <TableRow
                key={user._id}
                sx={{
                  '&:nth-of-type(odd)': { bgcolor: 'hsl(var(--muted))' },
                  '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' },
                }}
              >
                <TableCell>
                  <Typography fontWeight={500}>{user.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontSize="small">{user.phone}</Typography>
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={selecciones[user._id] || ''}
                    onChange={(e) => handleSelectChange(user._id, e.target.value)}
                    displayEmpty
                    disabled={unassignedRoutes.length === 0}
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="">
                      <em>
                        {unassignedRoutes.length === 0
                          ? 'Sin rutas disponibles'
                          : 'Seleccionar ruta'}
                      </em>
                    </MenuItem>
                    {unassignedRoutes.map((route) => (
                      <MenuItem key={route._id} value={route._id}>
                        {route.name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAsignar(user._id)}
                    disabled={!selecciones[user._id]}
                    sx={{
                      bgcolor: '#31d500',
                      '&:hover': {
                        bgcolor: 'hsl(var(--secondary) / 0.9)',
                      },
                    }}
                  >
                    Asignar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {apiAssignments.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
            Asignaciones Registradas
          </Typography>

          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#dddfd3', '& th': { color: 'black', fontWeight: 600 } }}>
                  <TableCell>Recolector</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Ruta Asignada</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiAssignments.map((assignment) => {
                  const user = users.find((u) => u._id === assignment.user_id);
                  const route = routes.find((r) => r._id === assignment.route_id);
                  return (
                    <TableRow
                      key={assignment._id}
                      sx={{
                        '&:nth-of-type(odd)': { bgcolor: 'hsl(var(--muted))' },
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight={500}>{user?.name || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontSize="small">{user?.phone || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="hsl(var(--secondary))" fontWeight={600}>
                          {route?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteAssignment(assignment._id, assignment.user_id, assignment.route_id)}
                          title="Quitar asignación"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'hsl(var(--muted))', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Rutas sin asignar:</strong> {unassignedRoutes.length} de {routes.length}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Recolectores por asignar:</strong> {usuariosDisponibles.length} de {users.length}
        </Typography>
      </Box>
    </Container>
  );
}

