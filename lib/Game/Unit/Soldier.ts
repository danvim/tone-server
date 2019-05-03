import { UnitInterface } from 'tone-core/dist/lib/Game/Unit';
import {
  Cartesian,
  XyzEuler,
  EntityType,
  TILE_SIZE,
  BuildingType,
  PackageType,
  AnimType,
} from 'tone-core/dist/lib';
import { Game } from '..';
import { Unit } from '.';
import { Entity } from '../Entity';
import { Building } from '../Building';
import { ResourceType } from '../../Helpers';
import { Thing } from '../Thing';
import { WorkerJob, JobPriority } from './WorkerJob';
import { Barrack } from '../Building/Barrack';

export enum WorkerState {
  IDLE,
  GRABBING,
  DELIVERING,
}

export class Soldier extends Unit {
  public barrack: Barrack;
  constructor(
    game: Game,
    playerId: number,
    type: EntityType,
    position: Cartesian,
    barrack: Barrack,
  ) {
    super(game, playerId, type, position, new XyzEuler(0, 0, 0));
    this.barrack = barrack;
  }
}
