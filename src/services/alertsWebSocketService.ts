export interface AlertNotification {
  type: string;
  alert?: {
    _id: string;
    name_user: string;
    route_name: string;
    message: string;
    date: string;
  };
  message?: string;
}

const WS_URL = 'wss://innovahack.onrender.com/api/alerts/ws';

class AlertsWebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<(alert: AlertNotification) => void> = new Set();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  public connect(onMessage: (alert: AlertNotification) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Conexión en progreso'));
        return;
      }

      this.isConnecting = true;
      this.messageHandlers.add(onMessage);

      try {
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
          console.log('✅ Conectado al WebSocket de alertas');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data: AlertNotification = JSON.parse(event.data);
            console.log('📨 Mensaje de alerta recibido:', data);

            // Notificar a todos los handlers
            this.messageHandlers.forEach((handler) => {
              handler(data);
            });
          } catch (error) {
            console.error('Error al parsear mensaje de alerta:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ Error en WebSocket de alertas:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('❌ Desconectado del WebSocket de alertas');
          this.isConnecting = false;
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Intentando reconectar alertas... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => {
        const handler = Array.from(this.messageHandlers)[0];
        if (handler) {
          this.connect(handler).catch(console.error);
        }
      }, this.reconnectDelay);
    } else {
      console.error('❌ Máximo de intentos de reconexión de alertas alcanzado');
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.messageHandlers.clear();
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public onMessage(handler: (alert: AlertNotification) => void) {
    this.messageHandlers.add(handler);
  }

  public removeMessageHandler(handler: (alert: AlertNotification) => void) {
    this.messageHandlers.delete(handler);
  }
}

export const alertsWebSocketService = new AlertsWebSocketService();
