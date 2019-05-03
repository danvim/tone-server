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
import { WorkerJob, JobPriority, JobNature } from './WorkerJob';

export enum WorkerState {
  IDLE,
  GRABBING,
  DELIVERING,
}

export class Worker extends Unit {
  public get state() {
    return this.mstate;
  }

  public set state(newState: WorkerState) {
    switch (newState) {
      case WorkerState.DELIVERING:
        this.player.emit(PackageType.SET_ANIMATION, {
          uid: this.uuid,
          animType: AnimType.CARRYING,
        });
        break;
      case WorkerState.GRABBING:
      case WorkerState.IDLE:
        this.player.emit(PackageType.SET_ANIMATION, {
          uid: this.uuid,
          animType: AnimType.DEFAULT,
        });
    }
    this.mstate = newState;
  }
  public get name(): string {
    return 'Worker ' + this.uuid.substr(0, 6);
  }
  public job: WorkerJob | undefined;
  private mstate: WorkerState;
  constructor(
    game: Game,
    playerId: number,
    position: Cartesian,
    rotation: XyzEuler,
  ) {
    super(game, playerId, EntityType.WORKER, position, rotation);
    this.mstate = WorkerState.IDLE;
  }

  public frame(prevTicks: number, currTicks: number) {
    if (!this.job) {
      this.findJob();
    } else if (!this.target) {
      if (
        this.state === WorkerState.IDLE ||
        this.state === WorkerState.GRABBING
      ) {
        this.findGeneratorToGrab(this.job.resourceType);
      } else {
        this.target = this.game.bases[this.playerId];
      }
    } else if (this.state === WorkerState.IDLE) {
      if (this.job.jobNature === JobNature.RECRUITMENT) {
        super.frame(prevTicks, currTicks);
      } else {
        this.findGeneratorToGrab(this.job.resourceType);
      }
    } else {
      super.frame(prevTicks, currTicks);
    }
  }

  public searchJob() {
    // this.game.test();
    const jobs = Object.values(this.game.workerJobs).filter((j: WorkerJob) => {
      return j.playerId === this.playerId && j.needWorker;
    });
    let job: WorkerJob | undefined;
    job = jobs.reduce((prev: WorkerJob, curr: WorkerJob) => {
      if (prev.priority === JobPriority.EXCLUSIVE) {
        return prev;
      }
      if (curr.priority === JobPriority.EXCLUSIVE) {
        return curr;
      }
      if (prev.priority > curr.priority) {
        return prev;
      }
      if (prev.priority < curr.priority) {
        return curr;
      }
      const prevTotalDist = prev.target.cartesianPos.euclideanDistance(
        this.position,
      );
      const currTotalDist = curr.target.cartesianPos.euclideanDistance(
        this.position,
      );
      if (prevTotalDist > currTotalDist) {
        return curr;
      }
      return prev;
    }, jobs[0]);
    return job;
  }

  public findJob(job?: WorkerJob) {
    job = job || this.searchJob();
    if (job) {
      this.job = job;
      job.addWorker(this);
      this.findGeneratorToGrab(this.job.resourceType);
    }
  }

  /**
   * Find a generator or base to collect resource
   * for delevering to the target building
   *
   * if the target building is base,
   * dont give base for collection
   *
   * @param target delevery target building
   * @param resourceType
   */
  public searchGeneratorToGrab(
    target: Building,
    resourceType: ResourceType,
  ): Building | false {
    const generatorTypes: BuildingType[] = [BuildingType.BASE];
    if (resourceType === ResourceType.STRUCT) {
      generatorTypes.push(BuildingType.STRUCT_GENERATOR);
    } else if (resourceType === ResourceType.TRAINING_DATA) {
      generatorTypes.push(BuildingType.TRAINING_DATA_GENERATOR);
    } else if (resourceType === ResourceType.PRIME_DATA) {
      generatorTypes.push(BuildingType.PRIME_DATA_GENERATOR);
    }

    const generators = Object.values(this.game.buildings).filter(
      (building: Building) => {
        return (
          building.playerId === this.playerId &&
          generatorTypes.indexOf(building.buildingType) !== -1 &&
          building.isFunctional() &&
          building.uuid !== target.uuid
        );
      },
    );
    if (generators.length === 0) {
      return false;
    }
    // console.log(generators.map((g: Building) => g.name));
    const weightingFun = (source: Building) =>
      source.cartesianPos.euclideanDistance(this.position) +
        source.cartesianPos.euclideanDistance(target.cartesianPos) || Infinity;
    const sortedGenerators = generators.sort((a: Building, b: Building) => {
      return weightingFun(a) - weightingFun(b);
    });
    // console.log(
    //   sortedGenerators.map((g: Building) => ({
    //     name: g.name,
    //     weight: weightingFun(g),
    //   })),
    // );
    return sortedGenerators[0];
  }

  /**
   * Find a generator or the base to collect resouces
   * currently just base on shortest distance to the worker
   */
  public findGeneratorToGrab(resourceType: ResourceType): boolean {
    if (this.job) {
      if (this.job.jobNature === JobNature.RECRUITMENT) {
        this.target = this.job.target;
        this.job.progressOnTheWay += 1;
      } else {
        const target = this.searchGeneratorToGrab(
          this.job.target,
          resourceType,
        );
        if (target) {
          this.target = target;
          this.job.progressOnTheWay += 1;
          this.state = WorkerState.GRABBING;
          return true;
        }
      }
    }
    return false;
  }

  public arrive() {
    const targetBuilding = this.target as Building;
    if (this.job) {
      if (this.job.jobNature === JobNature.RECRUITMENT) {
        this.deliver(targetBuilding);
      }
    }
    if (this.state === WorkerState.DELIVERING) {
      this.deliver(targetBuilding);
    } else if (this.state === WorkerState.GRABBING) {
      if (this.job) {
        if (targetBuilding.tryGiveResource(this.job.resourceType, 1)) {
          this.grab(1);
        }
      } else {
        this.findJob();
      }
    }
  }

  /**
   *
   * @param amount delivered amount
   */
  public deliver(targetBuilding: Building) {
    this.state = WorkerState.IDLE;
    if (this.job) {
      targetBuilding.onResouceDelivered(this.job.resourceType, 1, this);
      this.job.progressOnTheWay -= 1;
      if (this.job.jobNature === JobNature.RECRUITMENT) {
        this.job.removeWorker(this);
        delete this.job;
        this.hp = 0;
        return;
      }
      if (!this.job.needWorker) {
        this.job.removeWorker(this);
        delete this.job;
        this.findJob();
      } else {
        if (!this.mayChangeJob()) {
          this.findGeneratorToGrab(this.job.resourceType);
        }
      }
    } else {
      this.findJob();
    }
  }

  public mayChangeJob() {
    const newJob = this.searchJob();
    if (this.job && newJob) {
      if (newJob.strictlyPriorThan(this.job)) {
        this.job.removeWorker(this);
        this.findJob(newJob);
        return true;
      }
    }
    return false;
  }

  /**
   *
   * @param amount grabbed amount
   */
  public grab(amount: number) {
    this.state = WorkerState.DELIVERING;
    if (this.job) {
      this.target = this.job.target;
    } else {
      this.findJob();
    }
  }

  public onDie() {
    if (this.job) {
      this.job.progressOnTheWay--;
      this.job.removeWorker(this);
    }
    super.onDie();
  }
}
