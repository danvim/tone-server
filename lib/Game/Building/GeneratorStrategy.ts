import { BuildingStrategy } from './BuildingStrategy';
import { Game } from '..';
import { Building } from '.';

export class GeneratorStrategy extends BuildingStrategy {
  public amount: number = 0;
  public capacity: number = 1; // -1 denotes unlimited capacity

  private period: number = -1;
  private prevGenerateTicks = 0;
  constructor(game: Game, building: Building) {
    super(game, building);
    this.period = 2000;
  }
  public setGeneratePeriod(period: number) {
    this.period = period;
  }
  public frame(prevTicks: number, currTicks: number) {
    if (
      this.period !== -1 &&
      currTicks - this.prevGenerateTicks >= this.period
    ) {
      this.prevGenerateTicks = currTicks;
      this.generate();
    }
  }
  public generate() {
    if (this.capacity === -1 || this.amount < this.capacity) {
      ++this.amount;
    }
  }
  public nextAvailable(currTicks: number) {
    if (this.amount > 0) {
      return 0;
    }
    return currTicks - this.prevGenerateTicks;
  }
}
