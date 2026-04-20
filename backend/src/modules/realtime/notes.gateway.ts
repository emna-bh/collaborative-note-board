import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';

type AuthenticatedSocket = Socket & {
  user?: {
    uid: string;
    email?: string;
    name?: string;
  };
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly roomName = 'notes-board';

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake.auth?.token;

    if (!token) {
      client.emit('error', 'Missing authentication token');
      client.disconnect(true);
      return;
    }

    try {
      const user = await this.authService.verifyToken(token);
      client.user = user;
      client.join(this.roomName);

      console.log(`Socket connected: ${client.id} (${user.uid})`);
    } catch (error) {
      console.error('Socket auth failed:', error);
      client.emit('error', 'Invalid authentication token');
      client.disconnect(true);
      return;
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ) {
    return {
      event: 'pong',
      data: payload ?? 'ok',
    };
  }

  emitNoteCreated(note: unknown) {
    console.log('📡 emit note.created', note);
    this.server.to(this.roomName).emit('note.created', note);
  }

  emitNoteUpdated(note: unknown) {
    console.log('📡 emit note.updated', note);
    this.server.to(this.roomName).emit('note.updated', note);
  }

  emitNoteDeleted(noteId: string) {
    console.log('📡 emit note.deleted', { id: noteId });
    this.server.to(this.roomName).emit('note.deleted', { id: noteId });
  }
}
