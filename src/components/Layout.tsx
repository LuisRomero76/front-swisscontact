import { useState, ReactNode } from 'react';
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

const drawerWidthExpanded = 250;
const drawerWidthCollapsed = 60;

const menuItems = [
  { text: 'Monitorear', icon: <MonitorIcon />, path: '/monitorear' },
  { text: 'Asignar Rutas', icon: <TableChartIcon />, path: '/asignar-rutas' },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
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
              justifyContent: 'space-between',
              width: '100%',
              gap: 2,
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >

            <Box
              component="img"
              src="/public/logo_ciudades_circulates.png"
              alt="Swisscontact"
              sx={{ width: 130, alignItems: 'end', display: { xs: 'none', sm: 'block' } }}
            />

            <Box
              component="img"
              src="/public/logo-0.png"
              alt="Swisscontact"
              sx={{ width: 130, alignItems: 'end', display: { xs: 'none', sm: 'block' } }}
            />
            <Box component="img" src="/public/gratis-png-indonesia-swisscontact-organizacion-sostenibilidad-asociacion-contacto.png" alt="Hojas" sx={{ height: 28 }} />
            
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
            bgcolor: 'hsl(var(--sidebar-background))',
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
                        ? 'hsl(var(--sidebar-accent-foreground))'
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
    </Box>
  );
}
