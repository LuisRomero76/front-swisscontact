import { useState, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MonitorIcon from '@mui/icons-material/Monitor';
import TableChartIcon from '@mui/icons-material/TableChart';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import Badge from '@mui/material/Badge';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AlertsModal from './AlertsModal';
import { fetchAlerts } from '@/services/alertsService';
import { alertsWebSocketService, type AlertNotification } from '@/services/alertsWebSocketService';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const drawerWidthExpanded = 250;
const drawerWidthCollapsed = 60;

const menuItems = [
  { text: 'Monitorear', icon: <MonitorIcon />, path: '/monitorear' },
  { text: 'Dashboard', icon: <AnalyticsIcon />, path: '/dashboard-completadas' },
  { text: 'Asignar Rutas', icon: <TableChartIcon />, path: '/asignar-rutas' },
  { text: 'Completados', icon: <TaskAltIcon />, path: '/complete' },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [realtimeAlerts, setRealtimeAlerts] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar cantidad de alertas al montar el componente
  useEffect(() => {
    // Cargar alertas iniciales
    loadAlertCount();

    // Conectar al WebSocket para alertas en tiempo real
    const connectToWebSocket = async () => {
      try {
        const handleAlertMessage = (notification: AlertNotification) => {
          console.log('Nueva alerta en Layout:', notification);
          // Actualizar el contador de alertas
          if (notification.alert) {
            setAlertCount((prev) => prev + 1);
            // Agregar la alerta a la lista en tiempo real
            setRealtimeAlerts((prev) => [notification.alert!, ...prev]);
          }
        };

        alertsWebSocketService.onMessage(handleAlertMessage);
        await alertsWebSocketService.connect(handleAlertMessage);
      } catch (err) {
        console.error('Error conectando al WebSocket de alertas en Layout:', err);
        // Si falla WebSocket, usar polling como respaldo
        const interval = setInterval(loadAlertCount, 30000);
        return () => clearInterval(interval);
      }
    };

    connectToWebSocket();

    return () => {
      // No desconectar aquí porque Layout es un componente raíz
      // El servicio se mantiene activo
    };
  }, []);

  const loadAlertCount = async () => {
    try {
      const alerts = await fetchAlerts();
      setAlertCount(alerts.length);
      setRealtimeAlerts(alerts);
    } catch (error) {
      console.error('Error loading alert count:', error);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOpenAlerts = () => {
    setAlertsModalOpen(true);
  };

  const handleCloseAlerts = () => {
    setAlertsModalOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'var(--primary)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              width: '100%',
              gap: 2,
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >

            <Box
              component="img"
              src="/logo_ciudades_circulates.png"
              alt="Swisscontact"
              sx={{ width: 130, alignItems: 'end', display: { xs: 'none', sm: 'block' } }}
            />

            <Box
              component="img"
              src="/logo-0.png"
              alt="Swisscontact"
              sx={{ width: 130, alignItems: 'end', display: { xs: 'none', sm: 'block' } }}
            />
            <Box component="img" src="/gratis-png-indonesia-swisscontact-organizacion-sostenibilidad-asociacion-contacto.png" alt="Hojas" sx={{ height: 28 }} />
            
            <ListItemIcon>
              <IconButton
                color="inherit"
                onClick={handleOpenAlerts}
                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                <Badge badgeContent={alertCount} color="error">
                  <NotificationsActiveIcon />
                </Badge>
              </IconButton>
            </ListItemIcon>

          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerOpen ? drawerWidthExpanded : drawerWidthCollapsed,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? drawerWidthExpanded : drawerWidthCollapsed,
            boxSizing: 'border-box',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            bgcolor: 'var(--sidebar-background)',
            borderRight: '1px solid hsl(var(--sidebar-border))',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'hidden', pt: 2 }}>
          <List>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: drawerOpen ? 'initial' : 'center',
                      px: 2.5,
                      bgcolor: isActive
                        ? 'hsl(var(--sidebar-accent))'
                        : 'transparent',
                      color: isActive
                        ? 'var(--sidebar-accent-foreground)'
                        : 'hsl(var(--sidebar-foreground))',
                      '&:hover': {
                        bgcolor: isActive
                          ? 'hsl(var(--sidebar-accent))'
                          : 'rgba(0,0,0,0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: drawerOpen ? 3 : 'auto',
                        justifyContent: 'center',
                        color: isActive
                          ? 'hsl(var(--sidebar-accent-foreground))'
                          : 'hsl(var(--sidebar-foreground))',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {drawerOpen && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          
          {drawerOpen && (
            <Box sx={{ px: 2.5, pt: 2 }}>
              <IconButton
                onClick={toggleDrawer}
                size="small"
                sx={{
                  color: 'hsl(var(--sidebar-foreground))',
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {children}
        </Box>
      </Box>

      {/* Modal de alertas */}
      <AlertsModal open={alertsModalOpen} onClose={handleCloseAlerts} realtimeAlerts={realtimeAlerts} onAlertsUpdate={setRealtimeAlerts} />
    </Box>
  );
}
