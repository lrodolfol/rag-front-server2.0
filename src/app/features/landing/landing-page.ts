import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClosingCallSection } from './closing-call-section/closing-call-section';
import { HeroSection } from './hero-section/hero-section';
import { HowItWorksSection } from './how-it-works-section/how-it-works-section';
import { PricingSection } from './pricing-section/pricing-section';
import { SiteFooter } from './site-footer/site-footer';
import { SiteHeader } from './site-header/site-header';
import { WhyBetterSection } from './why-better-section/why-better-section';

@Component({
  selector: 'app-landing-page',
  imports: [
    SiteHeader,
    HeroSection,
    HowItWorksSection,
    WhyBetterSection,
    PricingSection,
    ClosingCallSection,
    SiteFooter,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {}
