import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeedbackSnackbarService } from './feedback-snackbar.service';
import { FeedbackType } from './feedback-type';

describe('FeedbackSnackbarService', () => {
  let service: FeedbackSnackbarService;
  let openMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    openMock = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: { open: openMock } }],
    });
    service = TestBed.inject(FeedbackSnackbarService);
  });

  const expectedPoliteness: Record<FeedbackType, 'assertive' | 'polite'> = {
    error: 'assertive',
    warning: 'assertive',
    success: 'polite',
    info: 'polite',
  };

  for (const type of Object.keys(expectedPoliteness) as FeedbackType[]) {
    it(`should open a "${type}" snackbar with its panel class and politeness`, () => {
      service.open('Mensagem', type, 'Fechar');

      expect(openMock).toHaveBeenCalledWith('Mensagem', 'Fechar', {
        duration: 5000,
        panelClass: ['app-snackbar', `app-snackbar--${type}`],
        politeness: expectedPoliteness[type],
      });
    });
  }

  it('should pass an undefined action when none is given', () => {
    service.open('Mensagem', 'info');

    expect(openMock).toHaveBeenCalledWith('Mensagem', undefined, expect.any(Object));
  });
});
