import { Operation } from './Operation';
import { StudyRange } from './StudyRange';
import { StudyUnit } from './StudyUnit';

export class StudyUnitsFactory {
  generateUnitsToStudy(xRange: StudyRange, yRange: StudyRange, operations: Array<Operation>): Array<StudyUnit> {
    const generatedUnits: Array<StudyUnit> = [];

    for(let x: number = xRange.From; x <= xRange.To; x += 1) {
      for(let y: number = yRange.From; y <= yRange.To; y += 1) {
        operations.forEach(op => {
          generatedUnits.push(this.createUnit(x, y, op));
        })
      }
    }
    return this.randomizeUnits(generatedUnits);
  }

  createUnitsToStudy(unitsToStudy: StudyUnit[]): StudyUnit[] {
    return this.randomizeUnits(unitsToStudy);
  }

  private createUnit(x: number, y: number, op: Operation): StudyUnit {
    switch(op) {
      case Operation.Multiply:
        return new StudyUnit(x, y, op);
      case Operation.Divide:
        return new StudyUnit(x*y, y, op);
    }
  }

  private randomizeUnits(units: Array<StudyUnit>): Array<StudyUnit> {
    const result: Array<StudyUnit> = [];
    while(units.length > 0) {
      const index = this.getRandomArbitrary(0, units.length);
      result.push(units[index]);
      units.splice(index, 1);
    }
    return result;
  }

  private getRandomArbitrary(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }
}
