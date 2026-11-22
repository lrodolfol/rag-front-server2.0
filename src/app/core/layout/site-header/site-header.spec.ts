import { ViewportScroller } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';
import { AppPaths } from '../../routing/app-paths';
import { NavigationItem } from '../navigation-item';
import { SiteHeader } from './site-header';

const CHATBOT_ITEMS: readonly NavigationItem[] = [
  { label: 'início', icon: 'home', path: AppPaths.home },
  { label: 'cadastrar', icon: 'add_business', path: AppPaths.registerBusiness },
];

const LANDING_ITEMS: readonly NavigationItem[] = [
  { label: 'testar chatbot', icon: 'chat', path: AppPaths.chatbot },
];

describe('SiteHeader', () => {
  let fixture: ComponentFixture<SiteHeader>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeader, MatIconTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteHeader);
    element = fixture.nativeElement as HTMLElement;
  });

  async function render(items: readonly NavigationItem[]): Promise<void> {
    fixture.componentRef.setInput('navigationItems', items);
    await fixture.whenStable();
  }

  function navigationLinks(): HTMLAnchorElement[] {
    return Array.from(element.querySelectorAll<HTMLAnchorElement>('a[mat-button]'));
  }

  function findLink(text: string): HTMLAnchorElement {
    const link = Array.from(element.querySelectorAll('a')).find((candidate) =>
      candidate.textContent?.includes(text),
    );
    if (!link) {
      throw new Error(`Link "${text}" não encontrado.`);
    }
    return link;
  }

  it('should render the brand linking to the home page', async () => {
    await render(LANDING_ITEMS);
    const brand = findLink('AchaLocal');
    expect(element.querySelector('header')).not.toBeNull();
    expect(brand.getAttribute('href')).toBe('/');
    const icon = brand.querySelector('mat-icon[svgIcon="storefront"]');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should scroll to the top when the brand is clicked', async () => {
    await render(LANDING_ITEMS);
    const scroller = TestBed.inject(ViewportScroller);
    const scrollSpy = vi.spyOn(scroller, 'scrollToPosition');
    findLink('AchaLocal').click();
    expect(scrollSpy).toHaveBeenCalledWith([0, 0]);
  });

  it('should render the chatbot page items in order with icons and links', async () => {
    await render(CHATBOT_ITEMS);
    const links = navigationLinks();
    expect(links.map((link) => link.textContent?.trim())).toEqual(['início', 'cadastrar']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/', '/cadastrar-negocio']);
    expect(links[0].querySelector('mat-icon[data-mat-icon-name="home"]')).not.toBeNull();
    expect(links[1].querySelector('mat-icon[data-mat-icon-name="add_business"]')).not.toBeNull();
  });

  it('should render the landing item linking to the chatbot page', async () => {
    await render(LANDING_ITEMS);
    const links = navigationLinks();
    expect(links.length).toBe(1);
    expect(links[0].textContent?.trim()).toBe('testar chatbot');
    expect(links[0].getAttribute('href')).toBe('/chatbot');
    expect(links[0].querySelector('mat-icon[data-mat-icon-name="chat"]')).not.toBeNull();
  });
});
