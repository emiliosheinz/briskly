import {
  ClockIcon,
  StarIcon,
  FireIcon,
  HeartIcon,
  PlusCircleIcon,
  UserCircleIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'

import { routes } from '~/utils/navigation'

export function useMenuOptions() {
  const { data } = useSession()
  const isAuthenticated = !!data?.user

  const menuOptions = [
    {
      label: 'Meu Perfil',
      icon: UserCircleIcon,
      href: routes.userProfile(data?.user?.id || ''),
      isAuthRequired: true,
    },
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
      label: 'Configurações',
      icon: WrenchIcon,
      href: '#',
      isAuthRequired: true,
    },
  ]

  return {
    mobile: menuOptions.filter(({ isAuthRequired }) =>
      isAuthRequired ? isAuthenticated : true,
    ),

    desktop: {
      primary: menuOptions.filter(({ isAuthRequired }) => !isAuthRequired),
      secondary: menuOptions.filter(({ isAuthRequired }) =>
        isAuthRequired ? isAuthenticated : false,
      ),
    },
  }
}
