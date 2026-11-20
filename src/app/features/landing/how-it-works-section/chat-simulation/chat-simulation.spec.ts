import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { CHAT_MESSAGES } from '../../landing-content';
import { ChatSimulation } from './chat-simulation';

describe('ChatSimulation', () => {
  let fixture: ComponentFixture<ChatSimulation>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSimulation, MatIconTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatSimulation);
    fixture.componentRef.setInput('messages', CHAT_MESSAGES);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render an accessible list of messages', () => {
    const list = element.querySelector('[role="list"]');
    expect(list?.getAttribute('aria-label')).toBe('Exemplo de conversa');
    expect(element.querySelectorAll('[role="listitem"]').length).toBe(3);
  });

  it('should style messages by author', () => {
    const items = element.querySelectorAll('[role="listitem"]');
    expect(items[0].classList).toContain('message--user');
    expect(items[1].classList).toContain('message--assistant');
    expect(items[2].classList).toContain('message--user');
  });

  it('should render the recommendation as real text with address, price and contact', () => {
    const answer = element.querySelectorAll('[role="listitem"]')[1].textContent ?? '';
    expect(answer).toContain('Rua das Flores, 120');
    expect(answer).toContain('R$ 1,50');
    expect(answer).toContain('(11) 99999-0000');
    expect(element.querySelector('img')).toBeNull();
  });
});
