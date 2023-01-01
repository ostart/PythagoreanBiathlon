import { Operation } from './Operation';
import { SessionStatistics } from './SessionStatistics';
import { SessionStatisticsDto } from './SessionStatisticsDto';
import { StudyUnit } from './StudyUnit';

export class StudySession {
  Guid: string = crypto.randomUUID();
  private UnitsToStudy: Array<StudyUnit>;
  private Statistics: SessionStatistics;

  constructor(units: Array<StudyUnit> = new Array<StudyUnit>(), statistics: SessionStatistics = new SessionStatistics()) {
    this.UnitsToStudy = units;
    this.Statistics = statistics;
  }

  getUnitToStudy(): StudyUnit | null {
    return this.UnitsToStudy.length === 0 ? null : this.UnitsToStudy[0];
  }

  returnResultForUnitToStudy(result: number, date: Date = new Date()): void {
    if (this.UnitsToStudy.length === 0) return;
    const unitToStudy = this.UnitsToStudy.shift() as StudyUnit;
    if (this.checkResult(unitToStudy, result))
      this.Statistics.addSuccess(unitToStudy, date);
    else
    {
      this.Statistics.addFail(unitToStudy, date);
      this.UnitsToStudy.push(unitToStudy);
    }
  }

  getStatistics(): SessionStatisticsDto
  {
    return this.Statistics.getStatistics();
  }

  private checkResult(unitToStudy: StudyUnit, result: number): boolean {
    switch(unitToStudy.operation)
    {
      case Operation.Multiply:
        return unitToStudy.operand1 * unitToStudy.operand2 === result
      case Operation.Divide:
        return unitToStudy.operand1 / unitToStudy.operand2 === result
      default:
        return false;
    }
  }
}