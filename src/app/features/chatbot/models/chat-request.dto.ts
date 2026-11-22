// Nomes em snake_case: contrato do serviço de recomendação.
export interface ChatRequestDto {
  /** Texto do visitante após `trim`; 1–50 caracteres. */
  readonly message: string;
  /** UUID gerado ao criar a sessão; igual em todas as mensagens da visita. */
  readonly user_code: string;
}
