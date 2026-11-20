import { TestBed } from '@angular/core/testing';
import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-01-01T12:00:00'));
    await TestBed.configureTestingModule({
      imports: [SiteFooter],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the copyright with the current year', () => {
    const fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('footer p')?.textContent?.trim()).toBe(
      '© 2027 AchaLocal — diretório local com IA',
    );
  });
});
