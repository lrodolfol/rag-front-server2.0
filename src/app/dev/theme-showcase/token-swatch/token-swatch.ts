import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-token-swatch',
  templateUrl: './token-swatch.html',
  styleUrl: './token-swatch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenSwatch {
  readonly label = input.required<string>();
}
