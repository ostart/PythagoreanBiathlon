import { Operation } from "./Operation";

export class StudyUnit {
  operand1: number;
  operand2: number;
  operation: Operation;

  constructor(operand1: number, operand2: number, operation: Operation) {
    this.operand1 = operand1;
    this.operand2 = operand2;
    this.operation = operation;
  }
}
