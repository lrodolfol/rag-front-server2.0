# Contract: Seções e Conteúdo da Tela Inicial

**Feature**: [../spec.md](../spec.md) | Modelo visual: `.mine/tela_inicial/tela-inicial.excalidraw`

Contrato de UI: ordem das seções, componente responsável, estrutura semântica e textos exatos.
Os testes de componente verificam este contrato.

## Ordem e estrutura

| # | Componente | Landmark / heading | Conteúdo |
|---|------------|--------------------|----------|
| 1 | `SiteHeader` | `<header>` + `mat-toolbar` | Marca (ícone `storefront` + "AchaLocal"); botão "testar chatbot" (ícone `chat`); divisória inferior |
| 2 | `HeroSection` | `<section>`, **`h1`** | ver §2 |
| 3 | `HowItWorksSection` | `<section>`, `h2` | ver §3 (inclui `StepCard` ×3 e `ChatSimulation`) |
| 4 | `WhyBetterSection` | `<section>`, `h2` | ver §4 |
| 5 | `PricingSection` | `<section>`, `h2` | ver §5 (`mat-card` do plano) |
| 6 | `ClosingCallSection` | `<section>`, `h2` | ver §6 (inclui `ContactCard`) |
| 7 | `SiteFooter` | `<footer>` | ver §7 |

Seções 2–6 ficam dentro de `<main>`. Cada `<section>` usa `aria-labelledby` apontando para seu
heading. Ícones são decorativos (`aria-hidden="true"`), exceto quando forem o único conteúdo de um
controle (não ocorre nesta feature).

## §2 Destaque

- `h1`: "Seu negócio encontrado no estilo WhatsApp."
- Parágrafo: "Cadastre uma vez. Quando alguém perguntar “estou com fome” ou “preciso reformar”,
  nosso chatbot recomenda você — com endereço, preço e contato."
- Ação principal (`mat-flat-button`, ícone `add_business`): "cadastrar meu negócio"
- Ação secundária (`mat-stroked-button`, ícone `chat`): "testar o chat online"
- Ilustração: `hero-*.webp`, `alt` = "Ilustração de negócios locais — padaria, barbearia, loja de
  ferramentas e professor de idiomas — com balões de conversa e marcadores de localização"

## §3 Como funciona

- `h2`: "Como funciona"
- Subtítulo: "Dois lados de uma mesma plataforma: quem oferece e quem precisa."
- Cartões (`h3` = "{order}. {title}"):
  1. `edit_note` — "Cadastre" — "Conte sobre seu negócio: serviços, preços, horários,
     localização. Nosso serviço aprende e indexa."
  2. `forum` — "Usuário pergunta" — "No chatbot, alguém manda “preciso de aula de inglês”,
     “cabeleireiro”, padaria, pedreiro etc."
  3. `location_on` — "Recomendação" — "Nosso serviço encontra os negócios mais relevantes por
     similaridade e proximidade. Você aparece."
- Bloco linguagem natural:
  - `h3`: "Funciona com linguagem natural."
  - Texto: "Os usuários não precisam saber o nome certo da categoria. O serviço entende o contexto
    e encontra o negócio certo na sua base."
  - Botão (`mat-stroked-button`, ícone `arrow_forward` à direita): "testar agora"
- `ChatSimulation` (rótulo acessível "Exemplo de conversa"), mensagens:
  1. user: "Oi! Estou com fome, tem algum lugar bom pra comer pão de queijo aqui perto?"
  2. assistant: "Encontrei a Padaria Pão Dourado, a 600 m de você 🥖
     📍 Rua das Flores, 120 – Centro
     💲 Pão de queijo a partir de R$ 1,50
     📞 (11) 99999-0000"
  3. user: "Perfeito, obrigado!"

  (Negócio, endereço e telefone são fictícios.)

## §4 Por que é melhor que o Google?

- `h2`: "Por que é melhor que o Google?"
- Texto (FR-010, ≤ ~80 palavras):
  "No Google, você precisa saber o que digitar e ainda garimpar uma lista de links e anúncios. Aqui,
  basta contar o que você precisa, do seu jeito, como numa conversa de WhatsApp. O AchaLocal
  entende o contexto e responde direto com negócios da sua região — com endereço, preço e contato.
  E quem aparece é quem é relevante e está perto, não quem paga mais por anúncio."

## §5 Planos mensais

- `h2`: "Planos mensais"
- `mat-card`: título "Essencial"; preço "R$ 9,99/mês" (destaque); lista com ícone `check`:
  "respostas ilimitadas"; nota: "cancele quando quiser".

## §6 Chamada final e contato

- `h2`: "Pronto para alcançar maiores resultados?"
- Texto: "Não fazemos pedidos ou integração com empresas: disponibilizamos informações e ajudamos o
  cliente a encontrar o seu serviço."
- Lista de benefícios: `bolt` "Setup em 5 minutos"; `sentiment_satisfied` "Sem conhecimento
  técnico"; `trending_up` "Resultados rápidos".
- `ContactCard` (`mat-card` elevado): título "Fale com a gente"; texto "Atendimento somente por
  e-mail."; endereço visível `contato@tinosnegocios.com.br`; botão `mat-flat-button` (ícone `mail`)
  "Enviar e-mail" → `mailto:contato@tinosnegocios.com.br`.

## §7 Rodapé

- "© {ano atual} AchaLocal — diretório local com IA" (ano via data atual).

## Layout responsivo

| Largura | Destaque | Cartões "Como funciona" | Linguagem natural + conversa | Chamada final + contato |
|---------|----------|-------------------------|------------------------------|-------------------------|
| ≥ 960px | 2 colunas (texto · ilustração) | 3 em linha | 2 colunas | 2 colunas |
| 600–959px | 2 colunas | 3 em linha (ou 2+1) | 1 coluna | 1 coluna |
| < 600px | 1 coluna (ilustração abaixo) | 1 por linha | 1 coluna (conversa abaixo) | 1 coluna (contato abaixo) |

Largura máxima do conteúdo: 1120px, centralizado, com margem lateral mínima de 16px.
