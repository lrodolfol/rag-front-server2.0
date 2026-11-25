import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';
import { ChatbotPreviewCard } from './chatbot-preview-card';

describe('ChatbotPreviewCard', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotPreviewCard, MatIconTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(ChatbotPreviewCard);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should show the chat icon hidden from screen readers', () => {
    const icon = element.querySelector('mat-icon[data-mat-icon-name="chat"]');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should show the heading and the exact text', () => {
    expect(element.querySelector('h2')?.textContent?.trim()).toBe('Veja como aparece no chatbot');
    expect(element.querySelector('p')?.textContent?.trim()).toBe(
      'Teste perguntas como "estou com fome" no simulador.',
    );
  });

  it('should link "Abrir o chat" to /chatbot', () => {
    const link = element.querySelector<HTMLAnchorElement>('a');
    expect(link?.textContent?.trim()).toBe('Abrir o chat');
    expect(link?.getAttribute('href')).toBe('/chatbot');
  });
});
