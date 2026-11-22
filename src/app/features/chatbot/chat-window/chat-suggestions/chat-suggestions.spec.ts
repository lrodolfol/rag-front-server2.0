import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SUGGESTIONS, SUGGESTIONS_LABEL } from '../../chatbot-content';
import { ChatSuggestions } from './chat-suggestions';

describe('ChatSuggestions', () => {
  let fixture: ComponentFixture<ChatSuggestions>;
  let element: HTMLElement;
  let selected: string[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ChatSuggestions] }).compileComponents();
    fixture = TestBed.createComponent(ChatSuggestions);
    selected = [];
    fixture.componentInstance.suggestionSelected.subscribe((text) => selected.push(text));
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  function buttons(): HTMLButtonElement[] {
    return Array.from(element.querySelectorAll('button'));
  }

  it('should render the label and one pill button per suggestion in order', () => {
    expect(element.querySelector('.label')?.textContent?.trim()).toBe(SUGGESTIONS_LABEL);
    expect(buttons().map((button) => button.textContent?.trim())).toEqual([...SUGGESTIONS]);
    expect(buttons().every((button) => button.type === 'button')).toBe(true);
    expect(buttons().every((button) => button.hasAttribute('mat-stroked-button'))).toBe(true);
  });

  it('should expose the suggestions as a list labelled by the label', () => {
    const list = element.querySelector('[role="list"]') as HTMLElement;
    const label = element.querySelector('.label') as HTMLElement;
    expect(list.getAttribute('aria-labelledby')).toBe(label.id);
    expect(list.querySelectorAll('[role="listitem"]').length).toBe(SUGGESTIONS.length);
  });

  it('should emit the suggestion text when clicked', () => {
    buttons()[0].click();
    expect(selected).toEqual([SUGGESTIONS[0]]);
  });

  it('should be keyboard focusable through native buttons', () => {
    buttons()[1].focus();
    expect(document.activeElement).toBe(buttons()[1]);
    expect(buttons()[1].getAttribute('tabindex')).toBeNull();
  });

  it('should disable the buttons and ignore clicks when disabled', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    expect(buttons().every((button) => button.disabled)).toBe(true);
    buttons()[0].click();
    expect(selected).toEqual([]);
  });
});
