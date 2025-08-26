import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private userConnections = new Map<string, Socket[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, []);
      }
      this.userConnections.get(userId)?.push(client);
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, connections] of this.userConnections.entries()) {
      const index = connections.indexOf(client);
      if (index !== -1) {
        connections.splice(index, 1);
        if (connections.length === 0) {
          this.userConnections.delete(userId);
        }
        break;
      }
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.forEach((client) => client.emit(event, data));
    }
  }

  async sendToRole(role: string, event: string, data: any) {
    const users = await this.userService.findUsersByRole(role);
    users?.forEach((user) => {
      if (user?.id) {
        this.sendToUser(user.id, event, data);
      }
    });
  }
}
