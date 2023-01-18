import { StudyUnit } from './../models/StudyUnit';
import { Injectable } from '@angular/core';
import { Operation } from 'src/models/Operation';
import { SessionStatistics } from 'src/models/SessionStatistics';
import { StudyRange } from 'src/models/StudyRange';
import { StudySession } from 'src/models/StudySession';
import { StudyUnitsFactory } from 'src/models/StudyUnitsFactory';
import { SessionStatisticsDto } from 'src/models/SessionStatisticsDto';

@Injectable({ providedIn: 'root' })
export class BllService {
  private studySession: StudySession;

  constructor() {
    const unitsToStudy = new StudyUnitsFactory().generateUnitsToStudy(new StudyRange(2, 9), new StudyRange(2, 9), [Operation.Multiply, Operation.Divide]);
    this.studySession = new StudySession(unitsToStudy, new SessionStatistics());
  }

  init(unitsToStudy: StudyUnit[]): void {
    const randomizedUnits = new StudyUnitsFactory().createUnitsToStudy(unitsToStudy)
    this.studySession = new StudySession(randomizedUnits, new SessionStatistics());
  }

  unitToStudy(): StudyUnit | null {
    return this.studySession.getUnitToStudy();
  }

  returnResult(result: number): boolean | null {
    return this.studySession.returnResultForUnitToStudy(result);
  }

  getStatistics(): SessionStatisticsDto {
    return this.studySession.getStatistics();
  }

  calculateResult(unit: StudyUnit): number {
    return this.studySession.calculateResult(unit);
  }

  createUnit(x: number, y: number, op: Operation): StudyUnit {
    return new StudyUnitsFactory().createUnit(x, y, op);
  }
}
