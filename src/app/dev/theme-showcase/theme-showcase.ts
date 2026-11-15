import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FeedbackSnackbarService } from '../../core/feedback/feedback-snackbar.service';
import { FeedbackType } from '../../core/feedback/feedback-type';
import { ShowcaseDialog } from './showcase-dialog/showcase-dialog';
import { TokenSwatch } from './token-swatch/token-swatch';

const FEEDBACK_MESSAGES: Record<FeedbackType, string> = {
  error: 'Não foi possível salvar.',
  success: 'Dados salvos com sucesso.',
  info: 'Há uma nova versão disponível.',
  warning: 'Sua sessão expira em breve.',
};

@Component({
  selector: 'app-theme-showcase',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    TokenSwatch,
  ],
  templateUrl: './theme-showcase.html',
  styleUrl: './theme-showcase.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeShowcase {
  private readonly dialog = inject(MatDialog);
  private readonly feedback = inject(FeedbackSnackbarService);

  protected readonly nameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  protected readonly progressValue = signal(60);

  protected openDialog(): void {
    this.dialog.open(ShowcaseDialog);
  }

  protected showFeedback(type: FeedbackType): void {
    this.feedback.open(FEEDBACK_MESSAGES[type], type, 'Fechar');
  }
}
