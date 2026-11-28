/** Estados da página de cadastro de negócio (data-model.md §6). */
export type BusinessRegistrationStatus =
  | 'checking'
  | 'check-failed'
  | 'ready'
  | 'submitting'
  | 'submit-failed';
