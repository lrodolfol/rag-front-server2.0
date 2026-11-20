import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { APP_ICON_NAMES } from './app-icon-name';
import { provideAppIcons } from './provide-app-icons';

describe('provideAppIcons', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAppIcons()],
    });
  });

  it('should register every app icon pointing to its local SVG file', () => {
    const registry = TestBed.inject(MatIconRegistry);
    const http = TestBed.inject(HttpTestingController);

    for (const name of APP_ICON_NAMES) {
      registry.getNamedSvgIcon(name).subscribe();
      http.expectOne(`icons/${name}.svg`).flush('<svg></svg>');
    }
    http.verify();
  });
});
