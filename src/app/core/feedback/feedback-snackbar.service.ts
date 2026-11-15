import { AriaLivePoliteness } from '@angular/cdk/a11y';
import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { FeedbackType } from './feedback-type';

const DURATION_IN_MILLISECONDS = 5000;

const POLITENESS_BY_TYPE: Record<FeedbackType, AriaLivePoliteness> = {
  error: 'assertive',
  warning: 'assertive',
  success: 'polite',
  info: 'polite',
};

@Injectable({ providedIn: 'root' })
export class FeedbackSnackbarService {
  private readonly snackBar = inject(MatSnackBar);

  open(message: string, type: FeedbackType, action?: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message, action, {
      duration: DURATION_IN_MILLISECONDS,
      panelClass: ['app-snackbar', `app-snackbar--${type}`],
      politeness: POLITENESS_BY_TYPE[type],
    });
  }
}
