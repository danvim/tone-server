import {
  BuildingInterface,
  BuildingType,
  TILE_SIZE,
  EntityType,
  FightingStyle,
} from 'tone-core/dist/lib/Game';
import { Axial, XyzEuler, PackageType, ResourceType } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
import { Worker, WorkerState } from '../Unit/Worker';
import { WorkerJob } from '../Unit/WorkerJob';
import { Soldier } from '../Unit/Soldier';
import { JobPriority, JobNature } from 'tone-core/dist/lib/Game/Job';
import { Thing } from '../Thing';

export class Barrack extends Building {
  public get fightingStyle() {
    return this.mFightingStyle;
  }
  public set fightingStyle(fs: FightingStyle) {
    this.mFightingStyle = fs;
    this.soldiers.forEach((s: Soldier) => {
      s.fightingStyle = fs;
    });
  }
  public trainingDataStorage: number = 0;
  public storageJob?: WorkerJob;
  public soldierVariant: EntityType = EntityType.SOLDIER_0;
  public soldierQuota: number = 3;
  public soldiers: Soldier[] = [];
  public recruitmentJob?: WorkerJob;

  public trainingCount = 0; // number of soldiers now training
  public trainingTime = 10000; // total ticks required to train a soldier
  public trainStartTime = 0; // the start tick of current training soldier
  public nowTraining = false; // now barrack is training

  private mFightingStyle = FightingStyle.AGGRESSIVE;

  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.BARRACK, tilePosition);
  }

  public setFightingStyle(fs: FightingStyle, target: Thing) {
    this.mFightingStyle = fs;
    this.soldiers.forEach((s: Soldier) => {
      s.setFightingStyle(fs, target);
    });
  }

  public frame(prevTicks: number, currTicks: number) {
    if (this.nowTraining) {
      if (currTicks >= this.trainStartTime + this.trainingTime) {
        this.trainingCount--;
        const newSoldier = new Soldier(
          this.game,
          this.playerId,
          this.soldierVariant,
          this.cartesianPos,
          this,
        );
        newSoldier.fightingStyle = this.fightingStyle;
        this.soldiers.push(newSoldier);
        this.nowTraining = false;
      }
    } else {
      if (this.trainingCount > 0) {
        this.trainStartTime = currTicks;
        this.nowTraining = true;
      }
    }
  }

  public doneConstruction() {
    this.storageJob = new WorkerJob(
      this.playerId,
      this,
      ResourceType.TRAINING_DATA,
      JobPriority.LOW,
      JobNature.STORAGE,
    );
    if (!global.test) {
      this.callForRecuitment();
    }
  }

  public onDie() {
    if (this.storageJob) {
      this.storageJob.removeJob();
    }
    if (this.recruitmentJob) {
      this.recruitmentJob.removeJob();
    }
    this.soldiers.forEach((s: Soldier) => {
      const w = new Worker(this.game, this.playerId, s.position, s.rotation);
      w.hp = s.hp;
      s.hp = 0;
    });
    for (let i = 0; i < this.trainingCount; i++) {
      const w = new Worker(
        this.game,
        this.playerId,
        this.cartesianPos,
        new XyzEuler(0, 0, 0),
      );
    }
    super.onDie();
  }

  public onResouceDelivered(
    type: ResourceType,
    amount: number,
    worker?: Worker,
  ): number {
    if (!this.isFunctional()) {
      return super.onResouceDelivered(type, amount, worker);
    } else {
      if (type === ResourceType.TRAINING_DATA) {
        this.trainingDataStorage += amount;
        this.emitStorage();
        return amount;
      } else if (type === ResourceType.WORKER) {
        if (this.soldiers.length + this.trainingCount < this.soldierQuota) {
          this.trainingCount++;
          return 1;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    }
  }

  public tryGiveResource(resourceType: ResourceType, amount: number) {
    if (this.isFunctional()) {
      if (resourceType === ResourceType.TRAINING_DATA) {
        const a = Math.min(amount, this.trainingDataStorage);
        this.trainingDataStorage -= a;
        if (a > 0) {
          this.emitStorage();
        }
        return a;
      }
    }
    return 0;
  }

  public callForRecuitment() {
    this.recruitmentJob = new WorkerJob(
      this.playerId,
      this,
      ResourceType.WORKER,
      JobPriority.EXCLUSIVE,
      JobNature.RECRUITMENT,
    );
    return this.recruitmentJob;
  }

  public emitStorage() {
    this.player.emit(PackageType.UPDATE_RESOURCE_STORAGE, {
      uid: this.uuid,
      struct: 0,
      trainingData: this.trainingDataStorage,
      primeData: 0,
    });
  }
}
