import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { DiscardChangesDialog } from './discard-changes-dialog';

describe('DiscardChangesDialog', () => {
  let dialogRef: MatDialogRef<DiscardChangesDialog, boolean>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    dialogRef = TestBed.inject(MatDialog).open<DiscardChangesDialog, unknown, boolean>(
      DiscardChangesDialog,
    );
    TestBed.tick();
  });

  afterEach(() => {
    TestBed.inject(MatDialog).closeAll();
  });

  function overlay(): HTMLElement {
    return document.querySelector('.cdk-overlay-container') as HTMLElement;
  }

  function button(text: string): HTMLButtonElement | undefined {
    return Array.from(overlay().querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.textContent?.trim() === text,
    );
  }

  it('should show the title as the dialog heading', () => {
    expect(overlay().querySelector('h2')?.textContent?.trim()).toBe(
      'Descartar os dados preenchidos?',
    );
  });

  it('should give the initial focus to "Continuar editando"', () => {
    expect(button('Continuar editando')?.hasAttribute('cdkfocusinitial')).toBe(true);
  });

  it('should close with false on "Continuar editando"', async () => {
    const result = firstValueFrom(dialogRef.afterClosed());
    button('Continuar editando')?.click();
    expect(await result).toBe(false);
  });

  it('should close with true on "Descartar"', async () => {
    const result = firstValueFrom(dialogRef.afterClosed());
    button('Descartar')?.click();
    expect(await result).toBe(true);
  });
});
