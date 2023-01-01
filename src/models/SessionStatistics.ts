import { SessionStatisticsDto } from "./SessionStatisticsDto";
import { StudyUnit } from "./StudyUnit";

export class SessionStatistics {
  private success: Map<StudyUnit, number> = new Map<StudyUnit, number>();
  private fail: Map<StudyUnit, number> = new Map<StudyUnit, number>();
  startTime: Date = new Date();
  stopTime: Date = new Date();

  constructor(startTime: Date = new Date(), stopTime: Date = new Date()) {
    this.startTime = startTime;
    this.stopTime = stopTime;
  }

  addSuccess(unit: StudyUnit, updateStopTime: Date = new Date()): void {
    this.addTo(this.success, unit, updateStopTime);
  }

  addFail(unit: StudyUnit, updateStopTime: Date = new Date()): void {
    this.addTo(this.fail, unit, updateStopTime);
  }

  getStatistics(): SessionStatisticsDto {
    const unitNumberTuples = [...this.fail.entries()].sort((a, b) => b[1] - a[1]);
    const failureToRepeat: Array<StudyUnit> = unitNumberTuples.map(x => x[0]);
    const failureSize = unitNumberTuples.reduce((acc, v) => acc + v[1], 0);
    return new SessionStatisticsDto(this.timeSpent(), this.success.size, failureSize, failureToRepeat);
  }

  private timeSpent(): Date {
    const timeInMilliseconds = Math.abs(this.stopTime.getTime() - this.startTime.getTime());
    return new Date(timeInMilliseconds);
  }

  private addTo(map: Map<StudyUnit, number>, unit: StudyUnit, stopTime: Date = new Date()): void {
    const value = map.get(unit);
    map.set(unit, value == undefined ? 1 : value + 1);
    this.stopTime = stopTime;
  }
}
