/** Textos pt-BR, limites e timeout do cadastro de negócio (contracts/business-registration-ui.md). */

export const BUSINESS_REGISTRATION_PAGE_TITLE = 'Novo negócio — AchaLocal';

export const BUSINESS_REGISTRATION_TIMEOUT_MS = 30_000;

// Página
export const BACK_LABEL = 'Voltar';
export const PAGE_HEADING = 'Novo negócio';
export const PAGE_SUBHEADING =
  'Quanto mais claras e relevantes forem as informações sobre seu negócio, mais precisas serão as recomendações. Não exagere e não seja ambíguo.';
export const CHECKING_TEXT = 'Verificando seus dados';
export const CHECK_ERROR_TEXT =
  'Não foi possível carregar seus dados agora. Tente novamente em instantes.';
export const RETRY_LABEL = 'Tentar novamente';

// Seções
export const BASIC_INFO_SECTION = 'Informações básicas';
export const ADDRESS_SECTION = 'Endereço';
export const CONTACT_SECTION = 'Contato';

// Rótulos
export const NAME_LABEL = 'Nome do negócio';
export const DESCRIPTION_LABEL = 'Descrição rápida';
export const DETAILS_LABEL = 'Descrição completa';
export const ADDRESS_LABEL = 'Endereço completo';
export const EMAIL_LABEL = 'E-mail';
export const TELEPHONE_LABEL = 'Telefone';

// Placeholders
export const NAME_PLACEHOLDER = 'Restaurante frango feliz';
export const DESCRIPTION_PLACEHOLDER = 'Você bem alimentado';
export const DETAILS_PLACEHOLDER =
  'O que vocês fazem, especialidades, diferenciais, público, horário de funcionamento...';
export const EMAIL_PLACEHOLDER = 'seu@email.com.br';
export const TELEPHONE_PLACEHOLDER = '(11) 3333-3333';

export const DETAILS_HINT =
  'Esta descrição é usada pela IA para encontrar você quando alguém perguntar algo relacionado.';

// Envio
export const SUBMIT_LABEL = 'Cadastrar negócio';
export const SUBMITTING_LABEL = 'Cadastrando negócio';

// Diálogo de descarte
export const DISCARD_DIALOG_TITLE = 'Descartar os dados preenchidos?';
export const DISCARD_DIALOG_KEEP_EDITING = 'Continuar editando';
export const DISCARD_DIALOG_CONFIRM = 'Descartar';

// Snackbars
export const REGISTER_SUCCESS_TEXT = 'Negócio cadastrado com sucesso.';
export const ALREADY_REGISTERED_TEXT = 'Você já possui um negócio cadastrado.';
export const SNACKBAR_CLOSE_LABEL = 'Fechar';

// Falhas de envio (data-model.md §5)
export const GENERIC_FAILURE_TEXT =
  'Não foi possível cadastrar seu negócio agora. Tente novamente em instantes.';
export const INVALID_DATA_FAILURE_TEXT = 'Verifique os dados informados e tente novamente.';

// Mensagens de validação (data-model.md §1)
export const REQUIRED_FIELD_TEXT = 'Campo obrigatório.';
export const MIN_LENGTH_TEXT = (requiredLength: number): string =>
  `Informe pelo menos ${requiredLength} caracteres.`;
export const MAX_LENGTH_TEXT = (requiredLength: number): string =>
  `Use no máximo ${requiredLength} caracteres.`;
export const INVALID_EMAIL_TEXT = 'Informe um e-mail válido.';
export const INVALID_PHONE_TEXT = 'Informe um telefone válido com DDD.';

// Limites
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 150;
export const DETAILS_MIN_LENGTH = 20;
export const DETAILS_MAX_LENGTH = 1000;
export const ADDRESS_MIN_LENGTH = 5;
export const ADDRESS_MAX_LENGTH = 200;
export const EMAIL_MAX_LENGTH = 150;
export const TELEPHONE_MAX_DIGITS = 11;
