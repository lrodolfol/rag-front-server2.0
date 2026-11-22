export type ChatStreamEvent =
  { readonly type: 'chunk'; readonly text: string } | { readonly type: 'done' };
