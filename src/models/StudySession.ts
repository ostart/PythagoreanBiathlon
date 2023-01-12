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

  returnResultForUnitToStudy(result: number, date: Date = new Date()): boolean | null {
    if (this.UnitsToStudy.length === 0) return null;
    const unitToStudy = this.UnitsToStudy.shift() as StudyUnit;
    if (this.checkResult(unitToStudy, result))
    {
      this.Statistics.addSuccess(unitToStudy, date);
      return true;
    }
    else
    {
      this.Statistics.addFail(unitToStudy, date);
      this.UnitsToStudy.push(unitToStudy);
      return false;
    }
  }

  getStatistics(): SessionStatisticsDto
  {
    return this.Statistics.getStatistics();
  }

  calculateResult(unitToStudy: StudyUnit): number {
    switch(unitToStudy.operation)
    {
      case Operation.Multiply:
        return unitToStudy.operand1 * unitToStudy.operand2;
      case Operation.Divide:
        return unitToStudy.operand1 / unitToStudy.operand2;
      default:
        throw new Error();
    }
  }

  private checkResult(unitToStudy: StudyUnit, result: number): boolean {
    return this.calculateResult(unitToStudy) === result;
  }
}
