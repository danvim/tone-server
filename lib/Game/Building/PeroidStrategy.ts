export class PeriodStrategy {
  public period: number;
  public prevTriggerTicks: number;
  public onPeriod: () => void;
  constructor(period: number, onPeroid: () => void) {
    this.period = period;
    this.prevTriggerTicks = 0;
    this.onPeriod = onPeroid;
  }
  public frame(prevTicks: number, currTicks: number) {
    if (
      this.period !== -1 &&
      currTicks - this.prevTriggerTicks >= this.period
    ) {
      this.prevTriggerTicks = currTicks;
      this.onPeriod();
    }
  }
}
