import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MESSAGE_INPUT_LABEL, MESSAGE_MAX_LENGTH, SEND_BUTTON_LABEL } from '../../chatbot-content';

@Component({
  selector: 'app-chat-composer',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatHint,
    MatInput,
    CdkTextareaAutosize,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './chat-composer.html',
  styleUrl: './chat-composer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComposer {
  readonly disabled = input<boolean>(false);
  readonly blockedHint = input<string | null>(null);
  readonly send = output<string>();

  protected readonly blockedHintId = 'chat-composer-blocked-hint';

  protected readonly inputLabel = MESSAGE_INPUT_LABEL;
  protected readonly sendLabel = SEND_BUTTON_LABEL;
  protected readonly maxLength = MESSAGE_MAX_LENGTH;

  protected readonly messageControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(MESSAGE_MAX_LENGTH)],
  });

  private readonly messageValue = toSignal(this.messageControl.valueChanges, { initialValue: '' });
  private readonly messageInput =
    viewChild.required<ElementRef<HTMLTextAreaElement>>('messageInput');

  protected readonly characterCount = computed(() => this.messageValue().length);
  protected readonly canSubmit = computed(
    () => !this.disabled() && this.messageValue().trim().length > 0,
  );

  constructor() {
    let wasDisabled = false;
    effect(() => {
      const isDisabled = this.disabled();
      if (isDisabled) {
        this.messageControl.disable({ emitEvent: false });
      } else {
        this.messageControl.enable({ emitEvent: false });
        if (wasDisabled) {
          // FR-017: foco volta ao campo ao fim da resposta (exceção de DOM — plan.md, Complexity Tracking).
          untracked(() => this.messageInput().nativeElement.focus());
        }
      }
      wasDisabled = isDisabled;
    });
  }

  protected onEnter(event: Event): void {
    if ((event as KeyboardEvent).shiftKey) {
      return;
    }
    event.preventDefault();
    this.submit();
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      return;
    }
    this.send.emit(this.messageControl.value);
    this.messageControl.reset('');
  }
}
