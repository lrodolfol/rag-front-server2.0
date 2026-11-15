# Configurações visuais da aplicação

Configurar a fundação visual da aplicação usando Angular Material como
biblioteca oficial de componentes.

Objetivo: garantir que toda tela futura use automaticamente a identidade visual do produto,
sem que desenvolvedores precisem definir cores manualmente.

Comportamento esperado:
- Componentes do Angular Material (botões, campos de formulário, cards, diálogos, snackbars,
  barras de progresso) exibem a identidade visual do produto sem estilização individual.
- Paleta: primária #00A35C (verde), fundo/superfície #FCFAF1 (off-white),
  detalhes/destaques #E8F3EA (verde claro).
- As cores ficam disponíveis como tokens centralizados, para uso em estilos de componentes
  próprios, sem valores hexadecimais repetidos.
- A tipografia é padronizada em toda a aplicação.
- A aparência funciona em desktop, tablet e smartphone.
- Textos devem ter contraste legível (acessibilidade WCAG AA).
- As cores principais são essas. Em alguns casos não há impedimentos em usar outras cores para não deixar a visualização super engessada.
- Evite a todo custo essas cores e suas variações: #FF0000, #0000FF, #FF00FF, #800080, #FF1493, #FF8000, #FFFF00
- Cores de erro. fundo: #FEE2E2 | texto:  #991B1B
- Cores de sucesso. fundo: #DCFCE7 | texto:  #166534
- Cores de info. fundo: #DBEAFE | texto:  #2563EB
- Cores de warn. fundo: #FEF3C7 | texto:  #D97706
- Utilize fontes padrões do Angular Material como `Roboto`, `Inter` e `OPEN SANS`

Fora do escopo: telas de negócio, layout/menu de navegação, autenticação, modo escuro.

Critérios de aceite:
- Um componente Material usado sem estilização extra já aparece com as cores da marca.
- Nenhum componente define cor por valor hexadecimal próprio.
- Contraste de texto atende WCAG AA.
