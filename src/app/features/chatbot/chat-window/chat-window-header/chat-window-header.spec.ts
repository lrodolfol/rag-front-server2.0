import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ASSISTANT_NAME, ASSISTANT_STATUS_TEXT } from '../../chatbot-content';
import { ChatWindowHeader } from './chat-window-header';

describe('ChatWindowHeader', () => {
  it('should render the assistant icon, name and status', async () => {
    await TestBed.configureTestingModule({
      imports: [ChatWindowHeader, MatIconTestingModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(ChatWindowHeader);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(
      element.querySelector('mat-icon[svgIcon="storefront"]')?.getAttribute('aria-hidden'),
    ).toBe('true');
    expect(element.querySelector('.name')?.textContent?.trim()).toBe(ASSISTANT_NAME);
    expect(element.querySelector('.status')?.textContent?.trim()).toBe(ASSISTANT_STATUS_TEXT);
  });
});
