# Implementation Plan: Tela Inicial (Landing Page) do AchaLocal

**Branch**: `main` (feature dir `002-landing-page`) | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-landing-page/spec.md`

## Summary

Criar a tela inicial pública do AchaLocal na rota raiz, fiel ao modelo Excalidraw: cabeçalho,
destaque com ilustração, "Como funciona" (3 passos + simulação de conversa estilo WhatsApp em
HTML), "Por que é melhor que o Google?", plano Essencial (R$ 9,99/mês), chamada final com contato
por e-mail (`mailto:contato@tinosnegocios.com.br`) e rodapé com ano dinâmico. A página é estática,
composta por componentes standalone pequenos (um por seção) em `features/landing/`, usando apenas
componentes Angular Material (toolbar, botões, cards, ícones) e tokens existentes da feature 001.
Ícones são SVGs locais registrados no `MatIconRegistry` (sem dependência nova); a ilustração é
convertida para WebP e servida com `NgOptimizedImage`. Os destinos ainda inexistentes
(`/cadastrar-negocio`, `/chatbot`) apontam para uma `ComingSoonPage` reutilizável.

## Technical Context

**Language/Version**: TypeScript ~6.0 (`strict: true`), SCSS, HTML de templates Angular

**Primary Dependencies**: Angular 22.2 (standalone, Signals, novo control flow, `NgOptimizedImage`,
`withComponentInputBinding`), Angular Material/CDK 22.2 (`MatToolbar`, `MatButton`, `MatCard`,
`MatIcon`, `MatDivider`). **Nenhuma dependência nova.**

**Storage**: N/A (conteúdo estático)

**Testing**: Vitest + jsdom via `ng test` (componentes, rotas com `RouterTestingHarness`, ano com
`vi.setSystemTime`); `npm run lint:colors` e `npm run lint:contrast`; Lighthouse manual para
acessibilidade/LCP (quickstart)

**Target Platform**: Navegadores evergreen; desktop, tablet e smartphone (≥ 360px)

**Project Type**: Web SPA Angular (projeto único)

**Performance Goals**: LCP ≤ 2 s em 4G (SC-003); ilustração ≤ 150 KB por variante WebP

**Constraints**: Orçamentos de produção (initial 500kB warn; estilo por componente 4kB warn / 8kB
error); WCAG 2.1 AA; sem cores fora dos tokens; textos em pt-BR; zero requisições externas de
fontes/ícones

**Scale/Scope**: 1 página com 7 seções (~11 componentes), 1 página provisória, 3 rotas, 12 ícones,
2 imagens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Como o plano atende |
|-----------|--------|---------------------|
| I. Angular moderno / TS estrito | PASS | Standalone, `input()` (ex.: `ChatSimulation.messages`, `StepCard.step`, `ComingSoonPage.featureName`), sem NgModules, sem `any`; `strict` já ativo. Sem `subscribe()` em componentes. |
| II. Responsabilidade única / por feature | PASS | `features/landing/` com um componente por seção e subcomponentes (`StepCard`, `ChatSimulation`, `PlanCard`, `ContactCard`); tipos em `models/`; conteúdo em `landing-content.ts`; `features/coming-soon/`; infra em `core/icons` e `core/routing`. Templates com `@for` sobre dados prontos, sem lógica. Nomes em inglês. |
| III. HTTP tipado | PASS / N/A | Nenhuma chamada de API. `provideHttpClient(withFetch())` é exigido apenas pelo `MatIconRegistry` para carregar SVGs locais. |
| IV. Segurança | PASS | Rotas públicas (sem guard necessário). Sem DOM direto: rolagem via `ViewportScroller`. `bypassSecurityTrustResourceUrl` aplicado somente a caminhos constantes de `public/icons/` (nunca entrada de usuário); `bypassSecurityTrustHtml` não usado. Nenhum dado sensível; e-mail de contato é público por definição. |
| V. UX e identidade visual | PASS | Textos 100% pt-BR; Material para todos os controles; cores somente via tokens existentes (sem tokens novos); estilos com escopo por componente; responsivo 360/768/1280. Estados de carregamento/erro/vazio: **não aplicável** — a tela não carrega dados (FR-018). Sem formulários. |
| VI. Testes | PASS | Specs por componente (conteúdo do contrato, links/destinos, ordem das seções, ausência de "meus negócios"/"sair", ano dinâmico, `mailto`), spec de rotas (`/`, `/cadastrar-negocio`, `/chatbot`), spec do registro de ícones. Sem regra de negócio além disso. E2E fora do escopo (exige spec própria). |
| VII. Dependências mínimas | PASS | Zero dependências novas: ícones como SVG locais (R-01), imagem otimizada com ferramenta pontual via `npx` não adicionada ao `package.json` (R-02), Lighthouse do navegador em vez de `axe-core` (R-12). Sem abstração de autenticação/relógio (R-04, R-10). |
| SDD | PASS | Spec clarificada (Q1, Q2 + e-mail). Nada fora do escopo: sem 404, sem autenticação, sem pagamento, sem formulário de contato. |

**Re-check pós-design (Phase 1)**: PASS — data model, contratos e quickstart não introduzem
dependências, chamadas HTTP de negócio nem cores novas. Riscos: (a) orçamento de 4kB de estilo por
componente — mitigado por um componente por seção; (b) conversão da imagem depende de ferramenta
externa pontual — alternativa manual (squoosh.app) registrada em research R-02.

## Project Structure

### Documentation (this feature)

```text
specs/002-landing-page/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── routes.md
│   └── landing-sections.md
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — NÃO criado aqui)
```

### Source Code (repository root)

```text
public/
├── icons/                                   # 12 SVGs Material Symbols, fill="currentColor" (R-01)
└── images/
    ├── hero-960.webp                        # ilustração do destaque (R-02)
    └── hero-1440.webp
src/
├── index.html                               # <title>AchaLocal</title>
└── app/
    ├── app.config.ts                        # + withComponentInputBinding, withInMemoryScrolling,
    │                                        #   provideHttpClient(withFetch()), provideAppIcons(), locale pt-BR
    ├── app.routes.ts                        # '' → LandingPage; cadastrar-negocio / chatbot → ComingSoonPage; ...DEV_ROUTES
    ├── app.routes.spec.ts
    ├── core/
    │   ├── icons/
    │   │   ├── app-icon-name.ts             # union type AppIconName
    │   │   ├── provide-app-icons.ts         # provideAppInitializer + MatIconRegistry.addSvgIcon
    │   │   └── provide-app-icons.spec.ts
    │   └── routing/
    │       └── app-paths.ts                 # AppPaths
    └── features/
        ├── landing/
        │   ├── landing-page.ts / .html / .scss / .spec.ts      # compõe as 7 seções
        │   ├── landing-content.ts                              # STEPS, CHAT_MESSAGES, ESSENTIAL_PLAN, BENEFITS, CONTACT_EMAIL
        │   ├── models/
        │   │   ├── how-it-works-step.ts
        │   │   ├── chat-message.ts
        │   │   ├── plan.ts
        │   │   └── benefit.ts
        │   ├── site-header/site-header.ts / .html / .scss / .spec.ts
        │   ├── hero-section/hero-section.ts / .html / .scss / .spec.ts
        │   ├── how-it-works-section/
        │   │   ├── how-it-works-section.ts / .html / .scss / .spec.ts
        │   │   ├── step-card/step-card.ts / .html / .scss / .spec.ts
        │   │   └── chat-simulation/chat-simulation.ts / .html / .scss / .spec.ts
        │   ├── why-better-section/why-better-section.ts / .html / .scss / .spec.ts
        │   ├── pricing-section/
        │   │   ├── pricing-section.ts / .html / .scss / .spec.ts
        │   │   └── plan-card/plan-card.ts / .html / .scss / .spec.ts
        │   ├── closing-call-section/
        │   │   ├── closing-call-section.ts / .html / .scss / .spec.ts
        │   │   └── contact-card/contact-card.ts / .html / .scss / .spec.ts
        │   └── site-footer/site-footer.ts / .html / .scss / .spec.ts
        └── coming-soon/
            └── coming-soon-page.ts / .html / .scss / .spec.ts
```

**Structure Decision**: Projeto Angular único. Introduz a pasta `src/app/features/` (arquitetura por
feature, Princípio II): `landing/` contém tudo que pertence à tela inicial; `coming-soon/` é uma
página independente reutilizada por várias rotas. `SiteHeader`/`SiteFooter` ficam em `landing/`
porque hoje só a tela inicial os usa; serão promovidos a `core/layout/` quando outra tela precisar
deles (Princípio VII). Infraestrutura transversal (ícones, caminhos de rota) vai para `core/`, ao
lado de `core/feedback` da feature 001.

## Complexity Tracking

| Exceção | Por que é necessária | Alternativa mais simples rejeitada porque |
|---------|----------------------|-------------------------------------------|
| `bypassSecurityTrustResourceUrl` no registro de ícones | `MatIconRegistry.addSvgIcon` exige `SafeResourceUrl` | Fonte de ícones externa/pacote npm violaria "zero requisições externas" ou Princípio VII; uso restrito a constantes locais |
| `provideHttpClient` sem chamadas de API | Necessário para o `MatIconRegistry` buscar os SVGs | Ícones inline exigiriam `bypassSecurityTrustHtml` (pior para segurança) |
