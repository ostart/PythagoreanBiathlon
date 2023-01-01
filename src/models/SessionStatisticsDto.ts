import { StudyUnit } from "./StudyUnit";

export class SessionStatisticsDto {
  SpentTime: Date;
  NumerOfSuccessful: number;
  NumberOfFailed: number;
  FailureToRepeat: Array<StudyUnit>;

  constructor(spentTime: Date, numberOfSuccessful: number, failed: number, failureToRepeat:  Array<StudyUnit>) {
    this.SpentTime = spentTime;
    this.NumerOfSuccessful = numberOfSuccessful;
    this.NumberOfFailed = failed;
    this.FailureToRepeat = failureToRepeat;
  }
}
