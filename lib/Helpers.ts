export function now(unit: string): number {
  const hrTime = process.hrtime();

  switch (unit) {
    case 'milli':
    case 'ms':
      return hrTime[0] * 1000 + hrTime[1] / 1000000;

    case 'micro':
    case 'us':
      return hrTime[0] * 1000000 + hrTime[1] / 1000;

    case 'nano':
    case 'ns':
      return hrTime[0] * 1000000000 + hrTime[1];

    default:
      return now('nano');
  }
}

export enum ResourceType {
  STRUCT,
  TRAINING_DATA,
  PRIME_DATA,
}

export function SNAKE2Normal(SNAKE_CASE: string) {
  return SNAKE_CASE.split('_')
    .map(([h, ...t]: any) => [h, ...t.toLocaleLowerCase()].join(''))
    .join(' ');
}
