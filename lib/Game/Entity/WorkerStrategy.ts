import { Entity } from '.';
import { Game } from '..';
import { Cartesian, TILE_SIZE, BuildingType } from 'tone-core/dist/lib';
import { Building } from '../Building';

interface WorkerJob {
  targetBuilding: Building;
}

enum WorkerState {
  IDLE,
  GRABBING,
  DELIVERING,
}

export class WorkerStrategy {
  public game: Game;
  public entity: Entity;
  public job: WorkerJob | null;
  public state: WorkerState;
  constructor(game: Game, entity: Entity) {
    this.game = game;
    this.entity = entity;
    this.job = null;
    this.state = WorkerState.IDLE;
  }

  public frame(prevTicks: number, currTicks: number) {
    if (this.job !== null && this.state !== WorkerState.IDLE) {
      // have job
      const distanceToTarget = this.entity.position.euclideanDistance(
        this.job.targetBuilding.tilePosition.toCartesian(TILE_SIZE),
      );

      if (distanceToTarget < 2) {
        // perform action to the target
        if (this.state === WorkerState.DELIVERING) {
          this.state = WorkerState.IDLE;
        } else if (this.state === WorkerState.GRABBING) {
          this.state = WorkerState.DELIVERING;
        }
        this.findJob();
      } else if (
        distanceToTarget <
        this.entity.velocity.euclideanDistance(new Cartesian(0, 0))
      ) {
        // avoid overshooting to target position
        this.entity.position = this.job.targetBuilding.tilePosition.toCartesian(
          TILE_SIZE,
        );
      } else {
      }
    } else {
      // the worker have nothing to do, then find some job
      this.findJob();
    }
  }

  public findJob() {
    switch (this.state) {
      case WorkerState.IDLE:
        this.job = { targetBuilding: this.findGeneratorToGrab() };
        this.state = WorkerState.GRABBING;
    }
  }

  public findGeneratorToGrab() {
    const generatorTypes = [
      BuildingType.PRIME_DATA_GENERATOR,
      BuildingType.STRUCT_GENERATOR,
      BuildingType.TRAINING_DATA_GENERATOR,
      BuildingType.SHIELD_GENERATOR,
    ];
    const generators = Object.keys(this.game.buildings).filter(
      (uuid: string) => {
        const building = this.game.buildings[uuid];
        return (
          building.playerId == this.entity.playerId &&
          generatorTypes.indexOf(building.buildingType) !== -1
        );
      },
    );
    return this.game.buildings[
      generators.sort((a: string, b: string) => {
        return (
          this.game.buildings[a].tilePosition
            .toCartesian(TILE_SIZE)
            .euclideanDistance(this.entity.position) -
          this.game.buildings[b].tilePosition
            .toCartesian(TILE_SIZE)
            .euclideanDistance(this.entity.position)
        );
      })[0]
    ];
  }
}
