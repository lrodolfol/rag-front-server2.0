# Quickstart: Validar a Tela Inicial

**Feature**: [spec.md](./spec.md) | Contratos: [routes](./contracts/routes.md),
[seções](./contracts/landing-sections.md)

## Pré-requisitos

- Node e dependências instaladas (`npm install`). Nenhuma dependência nova nesta feature.
- Arquivos estáticos presentes: `public/images/hero-960.webp`, `public/images/hero-1440.webp`,
  `public/icons/*.svg` (12 ícones de R-01).

## 1. Verificações automáticas

```bash
npm test                 # specs Vitest das seções, ChatSimulation, ComingSoonPage, rodapé e rotas
npm run lint:colors      # nenhuma cor literal fora de src/styles/_tokens.scss
npm run lint:contrast    # pares de tokens continuam WCAG AA
npm run build            # build de produção dentro dos orçamentos (initial 500kB / estilo 4kB)
```

Esperado: todos passam sem avisos de orçamento.

## 2. Conteúdo e navegação (US1, US2, US5)

```bash
npm start   # http://localhost:4200/
```

1. `/` exibe as 7 seções na ordem do contrato, com os textos exatos (SC-001).
2. Cabeçalho mostra apenas "AchaLocal" e "testar chatbot"; **não** há "meus negócios" nem "sair".
3. "cadastrar meu negócio" → `/cadastrar-negocio` com "Cadastro de negócio — em breve" e botão de
   volta funcional.
4. "testar chatbot", "testar o chat online" e "testar agora" → `/chatbot` (SC-002).
5. Rolar até o fim e clicar na marca "AchaLocal" → volta ao topo.

## 3. Conteúdo informativo (US3, US4)

1. "Como funciona": 3 cartões numerados com ícone; conversa simulada com texto selecionável (não é
   imagem).
2. "Por que é melhor que o Google?" com o texto do contrato.
3. Plano "Essencial" — "R$ 9,99/mês", "respostas ilimitadas", "cancele quando quiser".
4. Área de contato mostra `contato@tinosnegocios.com.br`; "Enviar e-mail" abre o cliente de e-mail.
5. Rodapé mostra o ano corrente.

## 4. Responsividade (SC-004)

No DevTools (modo dispositivo), validar 360px, 768px e 1280px: sem rolagem horizontal, sem
sobreposição; em 360px a ilustração fica abaixo do texto e a conversa abaixo do bloco "linguagem
natural".

## 5. Acessibilidade e desempenho (SC-003, SC-005)

```bash
npm run build && npx http-server dist/ragFront/browser -p 8080   # ou servidor estático equivalente
```

Lighthouse (Chrome DevTools, modo mobile, throttling 4G padrão) em `http://localhost:8080/`:

- Acessibilidade: 100, sem violações de contraste/rótulo.
- LCP ≤ 2 s.
- Navegação apenas com teclado (Tab/Shift+Tab/Enter) alcança todos os botões e links, com foco
  visível.

## 6. Ilustração ausente (edge case)

Renomear temporariamente `public/images/hero-1440.webp` e recarregar: texto e botões do destaque
seguem visíveis e o layout não se desloca. Restaurar o arquivo.
