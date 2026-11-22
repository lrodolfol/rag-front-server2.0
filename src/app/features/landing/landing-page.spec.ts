import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';
import { LandingPage } from './landing-page';

describe('LandingPage', () => {
  let fixture: ComponentFixture<LandingPage>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage, MatIconTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render header, main and footer in order', () => {
    const children = Array.from(element.children).map((child) => child.tagName.toLowerCase());
    expect(children).toEqual(['app-site-header', 'main', 'app-site-footer']);
  });

  it('should render the five content sections inside main in the model order (SC-001)', () => {
    const sections = Array.from(element.querySelector('main')?.children ?? []).map((child) =>
      child.tagName.toLowerCase(),
    );
    expect(sections).toEqual([
      'app-hero-section',
      'app-how-it-works-section',
      'app-why-better-section',
      'app-pricing-section',
      'app-closing-call-section',
    ]);
  });

  it('should show "registrar" right after "testar chatbot" in the header, linking to /register', () => {
    const links = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('app-site-header a[mat-button]'),
    );
    expect(links[1]?.textContent?.trim()).toBe('registrar');
    expect(links[1]?.getAttribute('href')).toBe('/register');
    expect(links[1]?.querySelector('mat-icon')?.getAttribute('data-mat-icon-name')).toBe('person_add');
  });

  it('should show exactly "testar chatbot", "registrar" and "login" with "login" linking to /login', () => {
    const links = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('app-site-header a[mat-button]'),
    );
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'testar chatbot',
      'registrar',
      'login',
    ]);
    expect(links[2]?.getAttribute('href')).toBe('/login');
    expect(links[2]?.querySelector('mat-icon')?.getAttribute('data-mat-icon-name')).toBe('login');
  });

  it('should have exactly one h1 on the page', () => {
    expect(element.querySelectorAll('h1').length).toBe(1);
  });
});
