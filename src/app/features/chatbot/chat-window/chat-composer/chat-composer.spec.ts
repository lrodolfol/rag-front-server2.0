import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MESSAGE_INPUT_LABEL, SEND_BUTTON_LABEL } from '../../chatbot-content';
import { ChatComposer } from './chat-composer';

describe('ChatComposer', () => {
  let fixture: ComponentFixture<ChatComposer>;
  let element: HTMLElement;
  let sent: string[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComposer, MatIconTestingModule],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatComposer);
    sent = [];
    fixture.componentInstance.send.subscribe((text) => sent.push(text));
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  function textarea(): HTMLTextAreaElement {
    return element.querySelector('textarea') as HTMLTextAreaElement;
  }

  function button(): HTMLButtonElement {
    return element.querySelector('button') as HTMLButtonElement;
  }

  function hint(): string | undefined {
    return element.querySelector('mat-hint')?.textContent?.trim();
  }

  async function type(text: string): Promise<void> {
    textarea().value = text;
    textarea().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  function pressEnter(shiftKey = false): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey, cancelable: true });
    textarea().dispatchEvent(event);
    return event;
  }

  it('should limit the textarea to 50 characters with an accessible label', () => {
    expect(textarea().getAttribute('maxlength')).toBe('50');
    const label = element.querySelector(`label[for="${textarea().id}"]`);
    expect(label?.textContent?.trim()).toBe(MESSAGE_INPUT_LABEL);
  });

  it('should show and update the character counter', async () => {
    expect(hint()).toBe('0/50');
    await type('olá');
    expect(hint()).toBe('3/50');
  });

  it('should disable the send button for empty or blank text', async () => {
    expect(button().getAttribute('aria-label')).toBe(SEND_BUTTON_LABEL);
    expect(button().disabled).toBe(true);
    await type('   ');
    expect(button().disabled).toBe(true);
    await type('oi');
    expect(button().disabled).toBe(false);
  });

  it('should emit on Enter, prevent the default and clear the field', async () => {
    await type('oi');
    const event = pressEnter();
    await fixture.whenStable();
    expect(sent).toEqual(['oi']);
    expect(event.defaultPrevented).toBe(true);
    expect(textarea().value).toBe('');
  });

  it('should not emit on Shift+Enter', async () => {
    await type('oi');
    const event = pressEnter(true);
    expect(sent).toEqual([]);
    expect(event.defaultPrevented).toBe(false);
  });

  it('should emit when the send button is clicked', async () => {
    await type('oi');
    button().click();
    expect(sent).toEqual(['oi']);
  });

  it('should disable the field and the button and ignore Enter while disabled', async () => {
    await type('oi');
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    expect(textarea().disabled).toBe(true);
    expect(button().disabled).toBe(true);
    pressEnter();
    expect(sent).toEqual([]);
  });

  it('should not show a blocked hint by default', () => {
    expect(element.querySelector('.blocked-hint')).toBeNull();
  });

  it('should show the blocked hint linked to the textarea by aria-describedby', async () => {
    fixture.componentRef.setInput('blockedHint', 'Limite atingido.');
    await fixture.whenStable();
    const hintElement = element.querySelector('.blocked-hint') as HTMLElement;
    expect(hintElement.textContent?.trim()).toBe('Limite atingido.');
    expect(textarea().getAttribute('aria-describedby')?.split(' ')).toContain(hintElement.id);
  });

  it('should focus the textarea when it becomes enabled again', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    textarea().blur();
    fixture.componentRef.setInput('disabled', false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(textarea());
  });
});
