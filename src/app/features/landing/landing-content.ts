import { NavigationItem } from '../../core/layout/navigation-item';
import { AppPaths } from '../../core/routing/app-paths';
import { Benefit } from './models/benefit';
import { ChatMessage } from './models/chat-message';
import { HowItWorksStep } from './models/how-it-works-step';
import { Plan } from './models/plan';

export const LANDING_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'testar chatbot', icon: 'chat', path: AppPaths.chatbot },
];

export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = [
  {
    order: 1,
    title: 'Cadastre',
    description:
      'Conte sobre seu negócio: serviços, preços, horários, localização. Nosso serviço aprende e indexa.',
    icon: 'edit_note',
  },
  {
    order: 2,
    title: 'Usuário pergunta',
    description:
      'No chatbot, alguém manda “preciso de aula de inglês”, “cabeleireiro”, padaria, pedreiro etc.',
    icon: 'forum',
  },
  {
    order: 3,
    title: 'Recomendação',
    description:
      'Nosso serviço encontra os negócios mais relevantes por similaridade e proximidade. Você aparece.',
    icon: 'location_on',
  },
];

export const CHAT_MESSAGES: readonly ChatMessage[] = [
  {
    author: 'user',
    text: 'Oi! Estou com fome, tem algum lugar bom pra comer pão de queijo aqui perto?',
  },
  {
    author: 'assistant',
    text:
      'Encontrei a Padaria Pão Dourado, a 600 m de você 🥖\n' +
      '📍 Rua das Flores, 120 – Centro\n' +
      '💲 Pão de queijo a partir de R$ 1,50\n' +
      '📞 (11) 99999-0000',
  },
  { author: 'user', text: 'Perfeito, obrigado!' },
];

export const ESSENTIAL_PLAN: Plan = {
  name: 'Essencial',
  monthlyPriceInCents: 999,
  benefits: ['respostas ilimitadas'],
  cancellationNote: 'cancele quando quiser',
};

export const CLOSING_BENEFITS: readonly Benefit[] = [
  { label: 'Setup em 5 minutos', icon: 'bolt' },
  { label: 'Sem conhecimento técnico', icon: 'sentiment_satisfied' },
  { label: 'Resultados rápidos', icon: 'trending_up' },
];

export const CONTACT_EMAIL = 'contato@tinosnegocios.com.br';
