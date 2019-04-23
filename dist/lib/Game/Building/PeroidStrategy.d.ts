export declare class PeriodStrategy {
    period: number;
    prevTriggerTicks: number;
    onPeriod: () => void;
    constructor(period: number, onPeroid: () => void);
    frame(prevTicks: number, currTicks: number): void;
}
