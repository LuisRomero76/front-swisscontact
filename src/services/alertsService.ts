export interface Alert {
  _id: string;
  name_user: string;
  route_name: string;
  message: string;
  date: string;
}

const ALERTS_API = 'https://innovahack.onrender.com/api/alerts';

export async function fetchAlerts(): Promise<Alert[]> {
  try {
    const res = await fetch(ALERTS_API);
    if (!res.ok) {
      throw new Error(`Error fetching alerts: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

// Función para eliminar una alerta
export async function deleteAlert(alertId: string): Promise<boolean> {
  try {
    const res = await fetch(`${ALERTS_API}/${alertId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`Error deleting alert: ${res.status} ${res.statusText}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting alert:', error);
    return false;
  }
}

// Función auxiliar para formatear la fecha
export function formatAlertDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateString;
  }
}
