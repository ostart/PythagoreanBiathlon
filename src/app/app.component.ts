import { StudyUnit } from './../models/StudyUnit';
import { BllService } from './../services/bll.service';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SessionStatisticsDto } from 'src/models/SessionStatisticsDto';
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
})
export class AppComponent {
  title = 'PythagoreanBiathlon';
  form: FormGroup;
  targetState: string;
  unitToStudy: StudyUnit | null;
  sessionStatistics: SessionStatisticsDto | null;
  preSettingsHidden: boolean;
  studingModuleHidden: boolean;
  finalStatisticsHidden: boolean;
  statisticsResult: string;


  constructor(private bllService: BllService) {
    this.form = new FormGroup({
      result: new FormControl(null, [Validators.required])
    });
    this.targetState = 'null';
    this.statisticsResult = '';
    this.unitToStudy = bllService.unitToStudy();
    this.sessionStatistics = (this.unitToStudy === null) ? bllService.getStatistics() : null;
    this.preSettingsHidden = false;
    this.studingModuleHidden = false;
    this.finalStatisticsHidden = false;
    this.showModules(false, true, false);
  }

  submit() {
    if (this.form.valid)
    {
      const result: number = this.form.value.result;
      const inOut = this.bllService.returnResult(result);
      this.targetState = inOut ? 'in' : 'out';
      this.form.reset();
      this.unitToStudy = this.bllService.unitToStudy();
      if (this.unitToStudy === null)
      {
        this.sessionStatistics = this.bllService.getStatistics();
        this.showModules(false, false, true);
        this.statisticsResult = `${this.sessionStatistics.NumerOfSuccessful} : ${this.sessionStatistics.NumberOfFailed} for ${this.sessionStatistics.SpentTime.getTime() / 1000} s.`
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
}
