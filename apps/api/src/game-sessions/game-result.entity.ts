import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('game_results')
export class GameResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  challengeId: string;

  @Column()
  userId: string;

  @Column({ default: 0 })
  rank: number;

  @Column({ default: false })
  isWinner: boolean;

  @Column({ default: false })
  isLoser: boolean;

  @Column({ default: true })
  didParticipate: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
