// IDs estáticos como se solicitó
const ADMIN_ID = "6918c26392cd6492dbd79516";
const USER_ID = "6918c21792cd6492dbd79515";
const WS_URL = "wss://innovahack.onrender.com/ws/admin";

export interface LocationUpdate {
  user_id: string;
  name: string;
  lat: number;
  lng: number;
  route_id?: string;
  timestamp: string;
}

export interface ActiveUser {
  user_id: string;
  name: string;
  lat: number;
  lng: number;
  route_id?: string;
  last_update: string;
}

class TrackingService {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  public connect(onLocationUpdate: (location: ActiveUser) => void, onConnected?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error("Conexión en progreso"));
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(`${WS_URL}/${ADMIN_ID}`);

        this.ws.onopen = () => {
          console.log("✅ Conectado al servidor de tracking");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          onConnected?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("📨 Mensaje recibido:", data);

            this.handleMessage(data, onLocationUpdate);
          } catch (error) {
            console.error("Error al parsear mensaje:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("❌ Error WebSocket:", error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("❌ Desconectado del servidor");
          this.isConnecting = false;
          this.attemptReconnect(onLocationUpdate, onConnected);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(data: any, onLocationUpdate: (location: ActiveUser) => void) {
    switch (data.type) {
      case "active_users":
        // Lista inicial de usuarios activos
        if (data.users && Array.isArray(data.users)) {
          data.users.forEach((user: any) => {
            onLocationUpdate({
              user_id: user.user_id,
              name: user.name,
              lat: user.lat,
              lng: user.lng,
              route_id: user.route_id,
              last_update: user.last_update || new Date().toISOString(),
            });
          });
        }
        break;

      case "location_update":
        // Actualización de ubicación en tiempo real
        onLocationUpdate({
          user_id: data.user_id,
          name: data.name,
          lat: data.lat,
          lng: data.lng,
          route_id: data.route_id,
          last_update: data.timestamp || new Date().toISOString(),
        });
        break;

      case "user_connected":
        console.log(`🟢 ${data.name} se conectó`);
        break;

      case "user_disconnected":
        console.log(`🔴 ${data.name} se desconectó`);
        break;
    }

    // Ejecutar handlers personalizados si existen
    const handler = this.messageHandlers.get(data.type);
    if (handler) {
      handler(data);
    }
  }

  private attemptReconnect(onLocationUpdate: (location: ActiveUser) => void, onConnected?: () => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect(onLocationUpdate, onConnected).catch(console.error);
      }, this.reconnectDelay);
    } else {
      console.error("❌ Máximo de intentos de reconexión alcanzado");
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  public onMessageType(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const trackingService = new TrackingService();
