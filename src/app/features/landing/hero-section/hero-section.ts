import { IMAGE_LOADER, ImageLoaderConfig, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppPaths, toRouterLink } from '../../../core/routing/app-paths';

const HERO_DEFAULT_WIDTH = 1440;

/** Mapeia a largura solicitada para a variante WebP pré-gerada em public/images. */
const heroImageLoader = (config: ImageLoaderConfig): string =>
  `images/${config.src}-${config.width ?? HERO_DEFAULT_WIDTH}.webp`;

@Component({
  selector: 'app-hero-section',
  imports: [MatButton, MatIcon, RouterLink, NgOptimizedImage],
  providers: [{ provide: IMAGE_LOADER, useValue: heroImageLoader }],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  protected readonly registerBusinessLink = toRouterLink(AppPaths.registerBusiness);
  protected readonly chatbotLink = toRouterLink(AppPaths.chatbot);
}
