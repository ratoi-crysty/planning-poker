import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'planning-poker-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  formGroup: FormGroup;

  constructor(protected authService: AuthService, fb: FormBuilder, protected toastr: NbToastrService) {
    this.formGroup = fb.group({
      name: fb.control('', [Validators.required]),
    });
  }

  login() {
    if (this.formGroup.invalid) {
      return;
    }

    this.authService.login(this.formGroup.controls.name.value)
      .subscribe(
        () => {
          this.toastr.show('Logged in successfully', 'Login', {
            position: NbGlobalPhysicalPosition.TOP_RIGHT,
            destroyByClick: true,
            duration: 5000,
            status: 'success',
          });
        },
      );
  }
}
