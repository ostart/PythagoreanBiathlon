import { Operation } from './../Operation';
import { StudyUnit } from './../StudyUnit';
import { SessionStatistics } from './../SessionStatistics';
import { StudySession } from '../StudySession';
import { SessionStatisticsDto } from '../SessionStatisticsDto';

describe("StudySessionTests", () => {
  let session: StudySession;

  beforeEach(async () => {
    const statistics = new SessionStatistics(new Date(2023, 1, 1, 0, 0, 0));
    const units: Array<StudyUnit> = [new StudyUnit(2, 3, Operation.Multiply)];
    session = new StudySession(units, statistics);
  });

  it("should by created", () => {
    expect(session).toBeTruthy();
  });

  it("should have one successful", () => {
    const toStudy = session.getUnitToStudy();
    session.returnResultForUnitToStudy(6, new Date(2023, 1, 1, 0, 0, 1));
    const resultStatistics: SessionStatisticsDto = session.getStatistics();

    expect(resultStatistics.NumerOfSuccessful).toEqual(1);
    expect(resultStatistics.NumberOfFailed).toEqual(0);
    expect(resultStatistics.FailureToRepeat.length).toEqual(0);
    expect(resultStatistics.SpentTime.getTime()).toEqual(1000);
    expect(session.getUnitToStudy()).toBeNull();
  });

  it("should have one successful and 2 failed", () => {
    const toStudy = session.getUnitToStudy();
    session.returnResultForUnitToStudy(5, new Date(2023, 1, 1, 0, 0, 2));
    session.returnResultForUnitToStudy(7, new Date(2023, 1, 1, 0, 0, 3));
    session.returnResultForUnitToStudy(6, new Date(2023, 1, 1, 0, 0, 4));

    const resultStatistics: SessionStatisticsDto = session.getStatistics();

    expect(resultStatistics.NumerOfSuccessful).toEqual(1);
    expect(resultStatistics.NumberOfFailed).toEqual(2);
    expect(resultStatistics.FailureToRepeat.length).toEqual(1);
    const unitToRepeat = new StudyUnit(2, 3, Operation.Multiply);
    expect (resultStatistics.FailureToRepeat[0]).toEqual(unitToRepeat);
    expect(resultStatistics.SpentTime.getTime()).toEqual(4000);
    expect(session.getUnitToStudy()).toBeNull();
  });

  it("should have two successful and 3 failed sorted", () => {
    const statistics = new SessionStatistics(new Date(2023, 1, 1, 0, 0, 0));
    const units: Array<StudyUnit> = [new StudyUnit(12, 4, Operation.Divide), new StudyUnit(2, 3, Operation.Multiply)];
    const session = new StudySession(units, statistics);

    let toStudy = session.getUnitToStudy();
    session.returnResultForUnitToStudy(5, new Date(2023, 1, 1, 0, 0, 1));

    toStudy = session.getUnitToStudy();
    session.returnResultForUnitToStudy(7, new Date(2023, 1, 1, 0, 0, 2));

    toStudy = session.getUnitToStudy();
    session.returnResultForUnitToStudy(6, new Date(2023, 1, 1, 0, 0, 4));

    toStudy = session.getUnitToStudy();
    session.returnResultForUnitToStudy(6, new Date(2023, 1, 1, 0, 0, 4));

    toStudy = session.getUnitToStudy();
    session.returnResultForUnitToStudy(3, new Date(2023, 1, 1, 0, 0, 4));

    const resultStatistics: SessionStatisticsDto = session.getStatistics();

    expect(resultStatistics.NumerOfSuccessful).toEqual(2);
    expect(resultStatistics.NumberOfFailed).toEqual(3);
    expect(resultStatistics.FailureToRepeat.length).toEqual(2);
    const unitToRepeat1 = new StudyUnit(12, 4, Operation.Divide);
    const unitToRepeat2 = new StudyUnit(2, 3, Operation.Multiply);
    expect (resultStatistics.FailureToRepeat[0]).toEqual(unitToRepeat1);
    expect (resultStatistics.FailureToRepeat[1]).toEqual(unitToRepeat2);
    expect(resultStatistics.SpentTime.getTime()).toEqual(4000);
    expect(session.getUnitToStudy()).toBeNull();
  });
});