import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import {
  DISCARD_DIALOG_CONFIRM,
  DISCARD_DIALOG_KEEP_EDITING,
  DISCARD_DIALOG_TITLE,
} from '../business-registration-content';

/** Confirmação de descarte do "← Voltar": fecha com `true` só em "Descartar". */
@Component({
  selector: 'app-discard-changes-dialog',
  imports: [MatDialogModule, MatButton],
  templateUrl: './discard-changes-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscardChangesDialog {
  protected readonly title = DISCARD_DIALOG_TITLE;
  protected readonly keepEditingLabel = DISCARD_DIALOG_KEEP_EDITING;
  protected readonly confirmLabel = DISCARD_DIALOG_CONFIRM;
}
