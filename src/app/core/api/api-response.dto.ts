/** Envelope padrão das respostas do serviço de autenticação. */
export interface ApiResponseDto<T> {
  readonly statusCode: number;
  readonly success: boolean;
  readonly message: string;
  readonly data: T | null;
  readonly error: ApiErrorDto | null;
}

export interface ApiErrorDto {
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly instance: string;
  readonly errors?: Readonly<Record<string, readonly string[]>>;
  readonly correlationId: string;
}
