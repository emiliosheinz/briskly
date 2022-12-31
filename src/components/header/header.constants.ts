import {
  ClockIcon,
  StarIcon,
  FireIcon,
  HeartIcon,
  PlusCircleIcon,
  UserCircleIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline'

const MENU_OPTIONS = [
  {
    label: 'Para Revisar',
    icon: ClockIcon,
    href: '#',
  },
  {
    label: 'Mais Votados',
    icon: StarIcon,
    href: '#',
  },
  {
    label: 'Mais Recentes',
    icon: FireIcon,
    href: '#',
  },
  {
    label: 'Para Você',
    icon: HeartIcon,
    href: '#',
  },
  {
    label: 'Criar Deck',
    icon: PlusCircleIcon,
    href: '#',
  },
  {
    label: 'Meu Perfil',
    icon: UserCircleIcon,
    href: '#',
  },
  {
    label: 'Configurações',
    icon: WrenchIcon,
    href: '#',
  },
]

export const MOBILE_MENU_OPTIONS = [...MENU_OPTIONS]

export const DESKTOP_MENU_OPTIONS = {
  PRIMARY: MENU_OPTIONS.slice(0, 5),
  SECONDARY: MENU_OPTIONS.slice(5),
}
