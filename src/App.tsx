import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from "./components/Layout";
import MapView from "./components/MapView";
import AssignRoutes from "./components/AssignRoutes";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    primary: { main: '#d19c47ff' },
    secondary: { main: '#43a047' },
  },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/monitorear" replace />} />
          <Route path="/monitorear" element={<MapView />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/asignar-rutas" element={<AssignRoutes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
