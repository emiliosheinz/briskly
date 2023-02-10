import {
  ClockIcon,
  StarIcon,
  FireIcon,
  HeartIcon,
  PlusCircleIcon,
  UserCircleIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline'

import { routes } from '~/utils/navigation'

const MENU_OPTIONS = [
  {
    label: 'Para Revisar',
    icon: ClockIcon,
    href: routes.toBeReviewed(),
    isAuthRequired: true,
  },
  {
    label: 'Mais Votados',
    icon: StarIcon,
    href: '#',
    isAuthRequired: false,
  },
  {
    label: 'Mais Recentes',
    icon: FireIcon,
    href: '#',
    isAuthRequired: false,
  },
  {
    label: 'Para Você',
    icon: HeartIcon,
    href: '#',
    isAuthRequired: true,
  },
  {
    label: 'Criar Deck',
    icon: PlusCircleIcon,
    href: routes.createNewDeck(),
    isAuthRequired: false,
  },
  {
    label: 'Meu Perfil',
    icon: UserCircleIcon,
    href: '#',
    isAuthRequired: true,
  },
  {
    label: 'Configurações',
    icon: WrenchIcon,
    href: '#',
    isAuthRequired: true,
  },
]

export const MOBILE_MENU_OPTIONS = [...MENU_OPTIONS]

export const DESKTOP_MENU_OPTIONS = {
  PRIMARY: MENU_OPTIONS.filter(({ isAuthRequired }) => !isAuthRequired),
  SECONDARY: MENU_OPTIONS.filter(({ isAuthRequired }) => isAuthRequired),
}
