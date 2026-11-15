import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackSnackbarService } from '../../core/feedback/feedback-snackbar.service';
import { FeedbackType } from '../../core/feedback/feedback-type';
import { ThemeShowcase } from './theme-showcase';

describe('ThemeShowcase', () => {
  let fixture: ComponentFixture<ThemeShowcase>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeShowcase],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeShowcase);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  function findButton(label: string): HTMLButtonElement {
    const button = Array.from(element.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === label,
    );
    if (!button) {
      throw new Error(`Botão "${label}" não encontrado.`);
    }
    return button;
  }

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the page heading', () => {
    expect(element.querySelector('h1')?.textContent).toContain('Demonstração do tema');
  });

  it('should render every themed Material component', () => {
    expect(element.querySelector('button[mat-flat-button]')).not.toBeNull();
    expect(element.querySelector('button[mat-stroked-button]')).not.toBeNull();
    expect(element.querySelector('button[mat-button]')).not.toBeNull();
    expect(element.querySelector('mat-form-field')).not.toBeNull();
    expect(element.querySelector('mat-card')).not.toBeNull();
    expect(element.querySelectorAll('mat-progress-bar').length).toBe(2);
  });

  it('should open the dialog when clicking "Abrir diálogo"', () => {
    const dialog = TestBed.inject(MatDialog);
    const openSpy = vi.spyOn(dialog, 'open');

    findButton('Abrir diálogo').click();

    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('should show the required error after the field is touched while empty', async () => {
    const input = element.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.querySelector('mat-error')?.textContent).toContain('Campo obrigatório.');
  });

  const feedbackButtons: [string, FeedbackType][] = [
    ['Mostrar erro', 'error'],
    ['Mostrar sucesso', 'success'],
    ['Mostrar informação', 'info'],
    ['Mostrar alerta', 'warning'],
  ];

  for (const [label, type] of feedbackButtons) {
    it(`should open a "${type}" feedback when clicking "${label}"`, () => {
      const feedback = TestBed.inject(FeedbackSnackbarService);
      const openSpy = vi.spyOn(feedback, 'open');

      findButton(label).click();

      expect(openSpy).toHaveBeenCalledWith(expect.any(String), type, 'Fechar');
    });
  }

  it('should render the token swatch component', () => {
    expect(element.querySelector('app-token-swatch')?.textContent).toContain(
      'Este bloco usa apenas tokens centrais.',
    );
  });
});
