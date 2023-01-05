import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'PythagoreanBiathlon';
  form: FormGroup;

  constructor() {
    this.form = new FormGroup({
      result: new FormControl(null, [Validators.required])
    });
  }

  submit() {
    if (this.form.valid)
    {
      const  result: number = this.form.value.result;
      console.log(result);
      this.form.reset();
    }
  }
}
