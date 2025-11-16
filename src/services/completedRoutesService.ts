const API_URL = 'https://innovahack.onrender.com/api/agent/rutas-completadas';

export interface CompletedRoute {
  _id: string;
  nombre: string;
  foto_base64: string;
  volumen_porcentual: string;
  timestamp: string;
  ruta?: string;
}

export interface CompletedRoutesResponse {
  total: number;
  rutas_completadas: CompletedRoute[];
}

export const fetchCompletedRoutes = async (): Promise<CompletedRoutesResponse> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Error fetching completed routes: ${response.statusText}`);
    }
    const data: CompletedRoutesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching completed routes:', error);
    throw error;
  }
};

export const updateVolumePercentage = async (
  rutaId: string,
  nuevoVolumen: string
): Promise<CompletedRoute> => {
  try {
    const response = await fetch(`${API_URL}/${rutaId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        volumen_porcentual: nuevoVolumen,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error updating volume: ${response.statusText}`);
    }
    const data: CompletedRoute = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating volume:', error);
    throw error;
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
