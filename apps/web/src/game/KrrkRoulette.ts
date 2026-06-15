import seedrandom from 'seedrandom';
import { type FinishRanking, type KrrkPlayer, Roulette } from './roulette';

export type { KrrkPlayer, FinishRanking };

export class KrrkRoulette extends Roulette {
  constructor(container: HTMLElement) {
    super(container);
  }

  startWithSeed(players: KrrkPlayer[], seed: string) {
    const rng = seedrandom(seed);
    this.setPlayers(players, rng);
  }
}
