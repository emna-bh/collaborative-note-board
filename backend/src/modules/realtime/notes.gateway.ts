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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly roomName = 'notes-board';

  handleConnection(client: Socket) {
    client.join(this.roomName);
    console.log(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
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
