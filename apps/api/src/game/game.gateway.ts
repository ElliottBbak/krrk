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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSessionsService, RankingEntry } from '../game-sessions/game-sessions.service';
import { GroupMember } from '../groups/group-member.entity';
import { User } from '../users/user.entity';
import { SocketService } from '../socket/socket.service';

interface AuthSocket extends Socket {
  userId: string;
}

@WebSocketGateway({ cors: { origin: '*' }, path: '/socket.io' })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly startingChallenges = new Set<string>();
  private readonly finishingSessions = new Set<string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly gameSessionsService: GameSessionsService,
    private readonly socketService: SocketService,
    @InjectRepository(GroupMember)
    private readonly memberRepo: Repository<GroupMember>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  afterInit(server: Server) {
    this.socketService.setServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const token = (client.handshake.auth as { token?: string }).token;
      if (!token) throw new Error('no token');
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      (client as AuthSocket).userId = payload.sub as string;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('join_group')
  async handleJoinGroup(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { groupId: string },
  ) {
    const room = `group:${data.groupId}`;
    await client.join(room);
  }

  @SubscribeMessage('leave_group')
  async handleLeaveGroup(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { groupId: string },
  ) {
    await client.leave(`group:${data.groupId}`);
  }

  @SubscribeMessage('start_challenge_game')
  async handleStartChallengeGame(
    @ConnectedSocket() _client: AuthSocket,
    @MessageBody() data: { groupId: string; challengeId: string },
  ) {
    this.server.to(`group:${data.groupId}`).emit('game_invitation', {
      groupId: data.groupId,
      challengeId: data.challengeId,
    });
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { groupId: string; challengeId: string },
  ) {
    const room = `challenge:${data.challengeId}`;
    await client.join(room);

    const members = await this.memberRepo.find({
      where: { groupId: data.groupId },
      relations: ['user'],
    });

    const players = members.map((m) => ({
      id: m.userId,
      name: m.displayName,
      color: m.user.avatarColor,
    }));

    this.server.to(room).emit('room_joined', { room, players });
  }

  @SubscribeMessage('start_game')
  async handleStartGame(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { groupId: string; challengeId: string },
  ) {
    if (this.startingChallenges.has(data.challengeId)) return;
    this.startingChallenges.add(data.challengeId);

    const existing = await this.gameSessionsService.findPlayingSessionByChallenge(data.challengeId);
    if (existing) {
      this.startingChallenges.delete(data.challengeId);
      return;
    }

    const room = `challenge:${data.challengeId}`;

    const session = await this.gameSessionsService.createSession(
      data.groupId,
      data.challengeId,
    );
    await this.gameSessionsService.startSession(session.id);

    const members = await this.memberRepo.find({
      where: { groupId: data.groupId },
      relations: ['user'],
    });

    const players = members.map((m) => ({
      id: m.userId,
      name: m.displayName,
      color: m.user.avatarColor,
    }));

    const payload = { sessionId: session.id, seed: session.seed, players };
    client.emit('game_started', { ...payload, isHost: true });
    client.to(room).emit('game_started', { ...payload, isHost: false });

    this.startingChallenges.delete(data.challengeId);
  }

  @SubscribeMessage('game_finished')
  async handleGameFinished(
    @ConnectedSocket() _client: AuthSocket,
    @MessageBody() data: { sessionId: string; rankings: RankingEntry[] },
  ) {
    if (this.finishingSessions.has(data.sessionId)) return;
    this.finishingSessions.add(data.sessionId);

    const session = await this.gameSessionsService.findSession(data.sessionId);
    if (!session || session.status === 'DONE') {
      this.finishingSessions.delete(data.sessionId);
      return;
    }

    await this.gameSessionsService.saveResults(data.sessionId, data.rankings);

    const room = `challenge:${session.challengeId}`;
    this.server.to(room).emit('game_result', {
      sessionId: data.sessionId,
      rankings: data.rankings,
      loserId: data.rankings[data.rankings.length - 1]?.id,
      winnerId: data.rankings[0]?.id,
    });
  }
}
