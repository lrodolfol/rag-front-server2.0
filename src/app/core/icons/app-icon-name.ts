export const APP_ICON_NAMES = [
  'storefront',
  'chat',
  'add_business',
  'edit_note',
  'forum',
  'location_on',
  'bolt',
  'sentiment_satisfied',
  'trending_up',
  'mail',
  'arrow_forward',
  'check',
] as const;

export type AppIconName = (typeof APP_ICON_NAMES)[number];
