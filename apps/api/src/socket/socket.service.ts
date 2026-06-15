import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  emitToGroup(groupId: string, event: string, data: unknown) {
    this.server?.to(`group:${groupId}`).emit(event, data);
  }
}
