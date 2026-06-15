import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('game_sessions')
export class GameSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  challengeId: string;

  @Column()
  groupId: string;

  @Column({ default: 'WAITING' })
  status: string;

  @Column({ nullable: true })
  seed: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
