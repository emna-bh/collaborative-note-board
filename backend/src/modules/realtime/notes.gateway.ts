import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';
import type { Note } from '../notes/entities/note.entity';

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

type AuthenticatedSocket = Socket & {
  user?: CurrentUser;
};

@WebSocketGateway({
  cors: {
    origin: frontendOrigin,
  },
})
export class NotesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly roomName = 'notes-board';

  constructor(private readonly authService: AuthService) {}

  afterInit(server: Server) {
    server.use((client: AuthenticatedSocket, next) => {
      const token = this.getHandshakeToken(client);

      if (!token) {
        next(new Error('Missing authentication token'));
        return;
      }

      void this.authService
        .verifyToken(token)
        .then((user) => {
          client.user = user;
          next();
        })
        .catch((error) => {
          console.error('Socket auth failed:', error);
          next(new Error('Invalid authentication token'));
        });
    });
  }

  async handleConnection(client: AuthenticatedSocket) {
    if (!client.user) {
      client.disconnect(true);
      return;
    }

    await client.join(this.roomName);
    console.log(`Socket connected: ${client.id} (${client.user.uid})`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Socket disconnected: ${client.id}`);
  }

  private getHandshakeToken(client: Socket): string | null {
    const token = client.handshake.auth?.token;

    if (typeof token !== 'string') {
      return null;
    }

    const trimmedToken = token.trim();
    return trimmedToken.length > 0 ? trimmedToken : null;
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
    console.log('emit note.created', note);
    this.server.to(this.roomName).emit('note.created', note);
  }

  emitNoteUpdated(note: unknown) {
    console.log('emit note.updated', note);
    this.server.to(this.roomName).emit('note.updated', note);
  }

  emitNoteDeleted(noteId: string) {
    console.log('emit note.deleted', { id: noteId });
    this.server.to(this.roomName).emit('note.deleted', { id: noteId });
  }

  emitNotesReordered(
    notes: Array<Pick<Note, 'id' | 'position' | 'updatedAt'>>,
  ) {
    console.log('emit notes.reordered', notes);
    this.server.to(this.roomName).emit('notes.reordered', notes);
  }
}
