import { UnitInterface } from 'tone-core/dist/lib/Game/Unit';
import {
  Cartesian,
  FightingStyle,
  XyzEuler,
  EntityType,
  TILE_SIZE,
  BuildingType,
} from 'tone-core/dist/lib';
import { Game } from '..';
import { Unit } from '.';
import { Entity } from '../Entity';
import { Building } from '../Building';
import { ResourceType } from '../../Helpers';

interface WorkerJob {
  targetBuilding: Building;
}

enum WorkerState {
  IDLE,
  GRABBING,
  DELIVERING,
}

export class Worker extends Unit {
  public job: WorkerJob | null;
  public state: WorkerState;
  constructor(
    game: Game,
    playerId: number,
    position: Cartesian,
    rotation: XyzEuler,
  ) {
    super(game, playerId, EntityType.WORKER, position, rotation);
    this.job = null;
    this.state = WorkerState.IDLE;
    this.findJob();
  }

  public frame(prevTicks: number, currTicks: number) {
    if (this.job !== null && this.state !== WorkerState.IDLE) {
      // have job
      const distanceToTarget = this.position.euclideanDistance(
        this.job.targetBuilding.tilePosition.toCartesian(TILE_SIZE),
      );

      if (distanceToTarget < 2) {
        // perform action to the target
        this.action();
        this.findJob();
      } else if (
        distanceToTarget < this.velocity.euclideanDistance(new Cartesian(0, 0))
      ) {
        // avoid overshooting to target position
        this.position = this.job.targetBuilding.tilePosition.toCartesian(
          TILE_SIZE,
        );
      } else {
        this.travelByVelocity(prevTicks, currTicks);
      }
    } else {
      // the worker have nothing to do, then find some job
      this.findJob();
    }
  }

  public findJob() {
    switch (this.state) {
      case WorkerState.IDLE: {
        const targetBuilding = this.findGeneratorToGrab();
        if (targetBuilding === false) {
          break;
        }
        this.job = { targetBuilding };
        this.state = WorkerState.GRABBING;
        break;
      }
      // TODO: handle other states
      case WorkerState.DELIVERING: {
        const targetBuilding = this.findBuildingToDeliver();
        this.job = { targetBuilding };
        this.state = WorkerState.DELIVERING;
      }
    }
  }

  /**
   * Find a generator or the base to collect resouces
   * currently just base on shortest distance to the worker
   */
  public findGeneratorToGrab(): Building | false {
    const generatorTypes = [
      BuildingType.PRIME_DATA_GENERATOR,
      BuildingType.STRUCT_GENERATOR,
      BuildingType.TRAINING_DATA_GENERATOR,
      BuildingType.SHIELD_GENERATOR,
      BuildingType.BASE,
    ];
    const generators = Object.keys(this.game.buildings).filter(
      (uuid: string) => {
        const building = this.game.buildings[uuid];
        return (
          building.playerId === this.playerId &&
          generatorTypes.indexOf(building.buildingType) !== -1 &&
          building.isFunctional()
        );
      },
    );
    if (generators.length === 0) {
      return false;
    }
    return this.game.buildings[
      generators.sort((a: string, b: string) => {
        return (
          this.game.buildings[a].tilePosition
            .toCartesian(TILE_SIZE)
            .euclideanDistance(this.position) -
          this.game.buildings[b].tilePosition
            .toCartesian(TILE_SIZE)
            .euclideanDistance(this.position)
        );
      })[0]
    ];
  }

  public findBuildingToDeliver() {
    const buildingKeys = Object.keys(this.game.buildings).filter(
      (uuid: string) => {
        const building = this.game.buildings[uuid];
        return (
          building.playerId === this.playerId &&
          building.structProgress < building.structNeeded
        );
      },
    );
    if (buildingKeys.length === 0) {
      return Object.values(this.game.buildings).filter(
        (building: Building) =>
          building.buildingType === BuildingType.BASE &&
          building.playerId === this.playerId,
      )[0];
    }
    return this.game.buildings[buildingKeys[0]];
  }

  public action() {
    if (this.job) {
      if (this.state === WorkerState.DELIVERING) {
        this.state = WorkerState.IDLE;
        this.job.targetBuilding.onResouceDelivered(ResourceType.STRUCT, 1);
        this.findJob();
      } else if (this.state === WorkerState.GRABBING) {
        if (this.job.targetBuilding.tryGiveResource(ResourceType.STRUCT, 1)) {
          this.state = WorkerState.DELIVERING;
          this.findJob();
        }
      }
    }
  }
}
