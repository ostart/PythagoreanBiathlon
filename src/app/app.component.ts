import { SessionStatisticsDto } from 'src/models/SessionStatisticsDto';
import { Operation } from 'src/models/Operation';
import { StudyUnit } from 'src/models/StudyUnit';
import { Entry } from 'src/models/Entry';
import { BllService } from 'src/services/bll.service';
import { Component, ViewEncapsulation, ViewChild, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { trigger, transition, useAnimation } from '@angular/animations';
import { headShake, hinge, zoomIn } from 'ng-animate';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('target',
      [ transition('in => null', useAnimation(zoomIn), { params: {timing: 0.7} }),
        transition('null => out', useAnimation(headShake), { params: {timing: 0.7} }),
        transition('null => in', useAnimation(hinge), { params: {timing: 0.7} })]
    ),
  ],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
  title = 'УмноДел';
  formInputResult: FormGroup;
  formCheckboxNumbers: FormGroup;
  targetState: string;
  unitToStudy: StudyUnit | null = null;
  restMessage: string = '';
  sessionStatistics: SessionStatisticsDto | null;
  message: string = '';
  preSettingsHidden: boolean;
  studingModuleHidden: boolean;
  finalStatisticsHidden: boolean;
  statisticsResult: string;
  questionMark = '?';
  operationMarkSettings: Map<Operation, string> = new Map<Operation, string>();
  selectedOperations = 'multiply';
  selectedLanguage = 'ru';
  isCheckedAll = true;
  @ViewChild("numberinput") numberInputField!: ElementRef;
  @ViewChildren("numberinput") numberInputFields!: QueryList<ElementRef>;


  constructor(private bllService: BllService, private translate: TranslateService) {
    translate.setDefaultLang(this.selectedLanguage);
    translate.use(this.selectedLanguage);
    this.formInputResult = new FormGroup({
      result: new FormControl(null)
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
    this.getUnitToMessage();
    this.sessionStatistics = (this.unitToStudy === null) ? this.bllService.getStatistics() : null;
    this.showModules(true, false, false);
  }


  ngAfterViewInit(): void {
    this.numberInputFields.changes.subscribe((nums: QueryList<ElementRef>) => {
      nums.first.nativeElement.focus();
    });
  }

  isCheckedAlltoggleChange() {
    this.isCheckedAll = !this.isCheckedAll;
    this.formCheckboxNumbers = new FormBuilder().group(this.generateCheckboxObject(this.isCheckedAll));
  }

  isCheckedRowToggleChange(row: number) {
    const selectedRows = this.filterObject(this.formCheckboxNumbers.value, ([k, v]) => k.startsWith(row.toString()));
    const selectedRowsTrue = this.filterObject(selectedRows, ([k, v]) => v === true)
    const selectedKeysTrue = Object.keys(selectedRowsTrue);
    const selectedKeys = Object.keys(selectedRows);
    const newFormCheckboxNumber = this.copyCheckboxObject(this.formCheckboxNumbers.value);
    if (selectedKeysTrue.length === 8)
    {
      selectedKeys.forEach(k => newFormCheckboxNumber[k] = false);
    }
    else
    {
      selectedKeys.forEach(k => newFormCheckboxNumber[k] = true);
    }
    this.formCheckboxNumbers = new FormBuilder().group(newFormCheckboxNumber);
  }

  isCheckedColumnToggleChange(column: number) {
    const selectedColumns = this.filterObject(this.formCheckboxNumbers.value, ([k, v]) => k.endsWith(column.toString()));
    const selectedColumnsTrue = this.filterObject(selectedColumns, ([k, v]) => v === true)
    const selectedKeysTrue = Object.keys(selectedColumnsTrue);
    const selectedKeys = Object.keys(selectedColumns);
    const newFormCheckboxNumber = this.copyCheckboxObject(this.formCheckboxNumbers.value);
    if (selectedKeysTrue.length === 8)
    {
      selectedKeys.forEach(k => newFormCheckboxNumber[k] = false);
    }
    else
    {
      selectedKeys.forEach(k => newFormCheckboxNumber[k] = true);
    }
    this.formCheckboxNumbers = new FormBuilder().group(newFormCheckboxNumber);
  }

  startClick() {
    const unitsToStudy: StudyUnit[] = this.createUnitsToStudy(this.formCheckboxNumbers.value, this.selectedOperations)
    this.bllService.init(unitsToStudy);
    this.getUnitToMessage();
    this.sessionStatistics = (this.unitToStudy === null) ? this.bllService.getStatistics() : null;
    this.showModules(false, true, false);
  }

  async submit() {
    const result: number = this.formInputResult.value.result;
    if (Boolean(result) || result === 0)
    {
      const inOut = this.bllService.returnResult(result);
      this.targetState = inOut ? 'in' : 'out';
      this.message = inOut ? `<span class="colorIn">${this.translate.instant('app.in-target').toUpperCase()}</span>` : `<span class="colorOut">${this.translate.instant('app.out-target').toUpperCase()}</span>`;
      this.formInputResult.reset();
      await this.delay(500);
      this.getUnitToMessage();
      if (this.unitToStudy === null)
      {
        this.sessionStatistics = this.bllService.getStatistics();
        this.showModules(false, false, true);
        const VoroshilovStriker = this.sessionStatistics.NumberOfFailed === 0 && this.sessionStatistics.NumerOfSuccessful > 0 ? `<p class="backgroundColorMain">${this.translate.instant('app.voroshilov-striker')}!</p>` : '';
        this.statisticsResult = `${VoroshilovStriker}
        <p class="colorIn">${this.translate.instant('app.in-target')}: ${this.sessionStatistics.NumerOfSuccessful}</p>
        <p class="colorOut">${this.translate.instant('app.out-target')}: ${this.sessionStatistics.NumberOfFailed}</p>
        <p>${this.translate.instant('app.time')}: ${this.msToTime(this.sessionStatistics.SpentTime.getTime())}</p>` + (
          (this.sessionStatistics.FailureToRepeat.length>0)
          ? `<p class="marginTop20 backgroundColorMain">${this.translate.instant('app.repeat')}:</p>${this.stringify(this.sessionStatistics.FailureToRepeat)}`
          : ''
        );
      }
    }
    this.numberInputField.nativeElement.value = '';
    this.numberInputField.nativeElement.focus();
  }

  onAnimationDoneEvent()
  {
    this.targetState = 'null';
  }

  errorValidationIfNotChecked(): boolean {
    const selectedNumbers = this.filterObject(this.formCheckboxNumbers.value, ([k, v]) => v === true);
    const selectedKeys = Object.keys(selectedNumbers);
    return selectedKeys.length === 0 ? true : false;
  }

  verifyIsCheckedAllToggle()
  {
    const selectedNumbers = this.filterObject(this.formCheckboxNumbers.value, ([k, v]) => v === true);
    const selectedKeys = Object.keys(selectedNumbers);
    if (selectedKeys.length === Object.keys(this.formCheckboxNumbers.value).length)
    {
      this.isCheckedAll = true;
    }
    if (selectedKeys.length === 0)
    {
      this.isCheckedAll = false;
    }
  }

  useLanguage(language: string): void {
    console.log('useLanguage ' + language);
    this.translate.use(language);
  }

  private showModules(preSettingsHidden: boolean, studingModuleHidden: boolean, finalStatisticsHidden: boolean): void {
    this.preSettingsHidden = preSettingsHidden;
    this.studingModuleHidden = studingModuleHidden;
    this.finalStatisticsHidden = finalStatisticsHidden;
  }

  private formQuestionMessage(unit: StudyUnit | null, result: string, settings: Map<Operation, string>): string {
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
      result.push(`<p>${this.formQuestionMessage(v, res.toString(), this.operationMarkSettings)}</p>`)
    });

    return result.join('');
  }

  private initOperationMarkSettings(): Map<Operation, string> {
    const result = new Map<Operation, string>();
    // result.set(Operation.Multiply, '*');
    result.set(Operation.Multiply, '<img class="picture-multiply" src="assets/multiply.svg">');
    // result.set(Operation.Divide, '/');
    result.set(Operation.Divide, '<img class="picture-divide" src="assets/divide.svg">');
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

  private copyCheckboxObject(value: {[k: string]: boolean}): {[k: string]: boolean} {
    const result: {[k: string]: boolean} = {};
    for (let i = 2; i <= 9; i+=1) {
      for (let j = 2; j <= 9; j+=1) {
        result[`${i}x${j}`] = value[`${i}x${j}`];
      }
    }
    return result;
  }

  private createUnitsToStudy(allNumbers: {[k: string]: boolean}, selectedOperations: string): StudyUnit[] {
    const result: StudyUnit[] = [];
    const operation: Operation[] = [];
    if (selectedOperations.includes('multiply'))
      operation.push(Operation.Multiply);
    if (selectedOperations.includes('divide'))
      operation.push(Operation.Divide);

    const selectedNumbers = this.filterObject(allNumbers, ([k, v]) => v === true);
    const selectedKeys = Object.keys(selectedNumbers);
    selectedKeys.forEach(k => {
      const [strX, strY] = k.split("x");
      const x = parseInt(strX);
      const y = parseInt(strY);
      operation.forEach(op => {
        result.push(this.bllService.createUnit(x, y, op));
      });
    });
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

  private getUnitToMessage() {
    this.unitToStudy = this.bllService.unitToStudy();
    this.message = this.formQuestionMessage(this.unitToStudy, this.questionMark, this.operationMarkSettings);
    this.restMessage = `${this.translate.instant('app.remaining')}: ${this.bllService.restToStudyCounter()}`;
  }
}
