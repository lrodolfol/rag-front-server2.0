import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhyBetterSection } from './why-better-section';

describe('WhyBetterSection', () => {
  let fixture: ComponentFixture<WhyBetterSection>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhyBetterSection],
    }).compileComponents();

    fixture = TestBed.createComponent(WhyBetterSection);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render the heading labelling the section', () => {
    const heading = element.querySelector('h2');
    expect(heading?.textContent?.trim()).toBe('Por que é melhor que o Google?');
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe(heading?.id);
  });

  it('should render the explanatory text', () => {
    const text = element.querySelector('p')?.textContent?.replace(/\s+/g, ' ').trim();
    expect(text).toBe(
      'No Google, você precisa saber o que digitar e ainda garimpar uma lista de links e anúncios. Aqui, basta contar o que você precisa, do seu jeito, como numa conversa de WhatsApp. O AchaLocal entende o contexto e responde direto com negócios da sua região — com endereço, preço e contato. E quem aparece é quem é relevante e está perto, não quem paga mais por anúncio.',
    );
  });
});
