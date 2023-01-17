import { SessionStatisticsDto } from 'src/models/SessionStatisticsDto';
import { Operation } from 'src/models/Operation';
import { StudyUnit } from 'src/models/StudyUnit';
import { Entry } from 'src/models/Entry';
import { BllService } from 'src/services/bll.service';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { trigger, transition, useAnimation } from '@angular/animations';
import { headShake, hinge } from 'ng-animate';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('target',
      [ transition('null => out', useAnimation(headShake), { params: {timing: 0.7} }),
        transition('null => in', useAnimation(hinge), { params: {timing: 0.7} })]
    ),
  ],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'PythagoreanBiathlon | Умножайка';
  formInputResult: FormGroup;
  formCheckboxNumbers: FormGroup;
  targetState: string;
  unitToStudy: StudyUnit | null;
  sessionStatistics: SessionStatisticsDto | null;
  message: string;
  preSettingsHidden: boolean;
  studingModuleHidden: boolean;
  finalStatisticsHidden: boolean;
  statisticsResult: string;
  questionMark = '?';
  operationMarkSettings: Map<Operation, string> = new Map<Operation, string>();
  selectedOperations = 'multiply';
  isCheckedAll = true;

  constructor(private bllService: BllService) {
    this.formInputResult = new FormGroup({
      result: new FormControl(null, [Validators.required])
    });
    this.formCheckboxNumbers = new FormBuilder().group(this.generateCheckboxObject(this.isCheckedAll));
    this.targetState = 'null';
    this.statisticsResult = '';
    this.preSettingsHidden = false;
    this.studingModuleHidden = false;
    this.finalStatisticsHidden = false;
    if (this.operationMarkSettings.size === 0) {
      this.operationMarkSettings = this.initOperationMarkSettings();
    }
    this.unitToStudy = bllService.unitToStudy();
    this.sessionStatistics = (this.unitToStudy === null) ? bllService.getStatistics() : null;
    this.message = this.formMessageFrom(this.unitToStudy, this.questionMark, this.operationMarkSettings);
    this.showModules(true, false, false);
  }

  isCheckedAlltoggleChange() {
    this.isCheckedAll = !this.isCheckedAll;
    this.formCheckboxNumbers = new FormBuilder().group(this.generateCheckboxObject(this.isCheckedAll));
  }

  startClick() {
    const unitsToStudy: StudyUnit[] = this.createUnitsToStudy(this.formCheckboxNumbers.value, this.selectedOperations)
    this.bllService.init(unitsToStudy);
    this.showModules(false, true, false);
  }

  async submit() {
    if (this.formInputResult.valid)
    {
      const result: number = this.formInputResult.value.result;
      const inOut = this.bllService.returnResult(result);
      this.targetState = inOut ? 'in' : 'out';
      this.message = inOut ? '<span class="colorIn">ТОЧНО</span>' : '<span class="colorOut">МИМО</span>';
      this.formInputResult.reset();
      await this.delay(500);
      this.unitToStudy = this.bllService.unitToStudy();
      this.message = this.formMessageFrom(this.unitToStudy, this.questionMark, this.operationMarkSettings)
      if (this.unitToStudy === null)
      {
        this.sessionStatistics = this.bllService.getStatistics();
        this.showModules(false, false, true);
        const VoroshilovStriker = this.sessionStatistics.NumberOfFailed === 0 ? '<p class="backgroundColorMain">Ворошиловский стрелок!</p>' : '';
        this.statisticsResult = `${VoroshilovStriker}
        <p class="colorIn">Точно: ${this.sessionStatistics.NumerOfSuccessful}</p>
        <p class="colorOut">Мимо: ${this.sessionStatistics.NumberOfFailed}</p>
        <p>Время: ${this.msToTime(this.sessionStatistics.SpentTime.getTime())}</p>` + (
          (this.sessionStatistics.FailureToRepeat.length>0)
          ? `<p class="marginTop20 backgroundColorMain">ПОВТОРИ:</p>${this.stringify(this.sessionStatistics.FailureToRepeat)}`
          : ''
        );
      }
    }
  }

  onAnimationDoneEvent()
  {
    this.targetState = 'null';
  }

  private showModules(preSettingsHidden: boolean, studingModuleHidden: boolean, finalStatisticsHidden: boolean): void {
    this.preSettingsHidden = preSettingsHidden;
    this.studingModuleHidden = studingModuleHidden;
    this.finalStatisticsHidden = finalStatisticsHidden;
  }

  private formMessageFrom(unit: StudyUnit | null, result: string, settings: Map<Operation, string>): string {
    return unit === null ? '' : `${unit.operand1} ${settings.get(unit.operation)} ${unit.operand2} = ${result}`;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private msToTime(duration: number): string {
    const milliseconds = Math.floor((duration % 1000) / 100);
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    const strHours = (hours < 10) ? "0" + hours : hours;
    const strMinutes = (minutes < 10) ? "0" + minutes : minutes;
    const strSeconds = (seconds < 10) ? "0" + seconds : seconds;

    return `${strHours}:${strMinutes}:${strSeconds}.${milliseconds}`;
  }

  private stringify(failureToRepeat: StudyUnit[]): string {
    const result: string[] = [];
    failureToRepeat.forEach(v => {
      const res: number = this.bllService.calculateResult(v);
      result.push(`<p>${this.formMessageFrom(v, res.toString(), this.operationMarkSettings)}</p>`)
    });

    return result.join('');
  }

  private initOperationMarkSettings(): Map<Operation, string> {
    const result = new Map<Operation, string>();
    // result.set(Operation.Multiply, '*');
    result.set(Operation.Multiply, '<mat-icon role="img" aria-hidden="false" fonticon="xmark" class="mat-icon notranslate material-icons mat-ligature-font mat-icon-no-color" data-mat-icon-type="font" data-mat-icon-name="xmark"></mat-icon>');
    // result.set(Operation.Divide, '/');
    result.set(Operation.Divide, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAhElEQVR4nO3YMQqFMBBF0bsQLcW9f4I7E9QN+BFiI5JCFDNyD7wm3SMzzYAkSXpUCyRgyRmAnoAlRmA9ZHtrCCSdlNjzI5ClUGTmI0UmAhkKRbaxC6MvLHtHME1e7DknRSwhSe9aX85tLII/wiOjJUnf13rXqoh3rdp416qNdy1JksR1fwlz4pNZY5vlAAAAAElFTkSuQmCC">');
    return result;
  }

  private generateCheckboxObject(value: boolean): {[k: string]: boolean} {
    const result: {[k: string]: boolean} = {};
    for (let i = 2; i <= 9; i+=1) {
      for (let j = 2; j <= 9; j+=1) {
        result[`${i}x${j}`] = value;
      }
    }
    return result;
  }

  private createUnitsToStudy(allNumbers: {[k: string]: boolean}, selectedOperations: string): StudyUnit[] {
    const selectedNumbers = this.filterObject(allNumbers, ([k, v]) => v === true);
    console.log(selectedNumbers);
    const result: StudyUnit[] = [];
    const operation: Operation[] = [];
    if (selectedOperations.includes('multiply'))
      operation.push(Operation.Multiply);
    if (selectedOperations.includes('divide'))
      operation.push(Operation.Divide);

    return result;
  }

  private filterObject<T extends object>(
    obj: T,
    fn: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean
  ) {
    return Object.fromEntries(
      (Object.entries(obj) as Entry<T>[]).filter(fn)
    ) as Partial<T>
  }
}
