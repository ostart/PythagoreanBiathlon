import { SessionStatisticsDto } from 'src/models/SessionStatisticsDto';
import { Operation } from 'src/models/Operation';
import { StudyUnit } from 'src/models/StudyUnit';
import { BllService } from 'src/services/bll.service';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
  title = 'PythagoreanBiathlon';
  form: FormGroup;
  targetState: string;
  unitToStudy: StudyUnit | null;
  sessionStatistics: SessionStatisticsDto | null;
  message: string;
  preSettingsHidden: boolean;
  studingModuleHidden: boolean;
  finalStatisticsHidden: boolean;
  statisticsResult: string;
  questionMark: string = '?';
  operationMarkSettings: Map<Operation, string> = new Map<Operation, string>();

  constructor(private bllService: BllService) {
    this.form = new FormGroup({
      result: new FormControl(null, [Validators.required])
    });
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
    this.showModules(false, true, false);
  }

  async submit() {
    if (this.form.valid)
    {
      const result: number = this.form.value.result;
      const inOut = this.bllService.returnResult(result);
      this.targetState = inOut ? 'in' : 'out';
      this.message = inOut ? '<span class="colorIn">ТОЧНО</span>' : '<span class="colorOut">МИМО</span>';
      this.form.reset();
      await this.delay(500);
      this.unitToStudy = this.bllService.unitToStudy();
      this.message = this.formMessageFrom(this.unitToStudy, this.questionMark, this.operationMarkSettings)
      if (this.unitToStudy === null)
      {
        this.sessionStatistics = this.bllService.getStatistics();
        this.showModules(false, false, true);
        const VoroshilovStriker = this.sessionStatistics.NumberOfFailed === 0 ? '<p>Ворошиловский стрелок!</p>' : '';
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
    result.set(Operation.Multiply, '*');
    result.set(Operation.Divide, '/');
    return result;
  }
}
