import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-showcase-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './showcase-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseDialog {}
