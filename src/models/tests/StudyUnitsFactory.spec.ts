import { Operation } from "../Operation";
import { StudyRange } from "../StudyRange";
import { StudyUnitsFactory } from "../StudyUnitsFactory";

describe("StudyUnitsFactoryTests", () => {
  it("should create 3 x 3 Pythagorean Table multiply array", () => {
    const factory = new StudyUnitsFactory();
    const result = factory.createUnitsToStudy(new StudyRange(2, 4), new StudyRange(2, 4), [Operation.Multiply]);
    expect(result.length).toEqual(9);
  });

  it("should create 4 x 4 Pythagorean Table divide array", () => {
    const factory = new StudyUnitsFactory();
    const result = factory.createUnitsToStudy(new StudyRange(2, 5), new StudyRange(2, 5), [Operation.Divide]);
    expect(result.length).toEqual(16);
  });

  it("should create 5 x 5 Pythagorean Table multiply + divide array", () => {
    const factory = new StudyUnitsFactory();
    const result = factory.createUnitsToStudy(new StudyRange(2, 6), new StudyRange(2, 6), [Operation.Multiply, Operation.Divide]);
    expect(result.length).toEqual(50);
  });
});
