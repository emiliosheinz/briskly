import { render, screen } from '~/utils/tests/react-testing-library'
import { withNextAuth } from '~/utils/tests/with-next-auth'

import { Header } from './header.component'

describe('Header Component', () => {
  describe('Loading Authentication', () => {
    it('should be correctly rendered', () => {
      const component = render(withNextAuth(<Header />, 'loading'))

      expect(component.asFragment()).toMatchSnapshot()
    })

    it('should render a link to the website home page', () => {
      render(withNextAuth(<Header />, 'loading'))

      const homeLink = screen.getByTestId('home-anchor')

      expect(homeLink).toBeInTheDocument()
    })

    it('should render only DesktopPrimaryMenu and MobileHamburgerMenu', () => {
      render(withNextAuth(<Header />, 'loading'))

      const desktopPrimaryMenu = screen.getByTestId('desktop-primary-menu')
      const mobileHamburgerMenu = screen.getByTestId('mobile-hamburger-menu')
      const desktopSecondaryMenu = screen.queryByTestId(
        'desktop-secondary-menu',
      )
      const authButton = screen.queryByTestId('auth-button')

      expect(desktopPrimaryMenu).toBeInTheDocument()
      expect(mobileHamburgerMenu).toBeInTheDocument()
      expect(desktopSecondaryMenu).not.toBeInTheDocument()
      expect(authButton).not.toBeInTheDocument()
    })
  })
  describe('Authenticated', () => {
    it('should be correctly rendered', () => {
      const component = render(withNextAuth(<Header />, 'authenticated'))

      expect(component.asFragment()).toMatchSnapshot()
    })

    it('should render a link to the website home page', () => {
      render(withNextAuth(<Header />, 'authenticated'))

      const homeLink = screen.getByTestId('home-anchor')

      expect(homeLink).toBeInTheDocument()
    })

    it('should render all the menus and no AuthButton', () => {
      render(withNextAuth(<Header />, 'authenticated'))

      const desktopPrimaryMenu = screen.getByTestId('desktop-primary-menu')
      const mobileHamburgerMenu = screen.getByTestId('mobile-hamburger-menu')
      const desktopSecondaryMenu = screen.getByTestId('desktop-secondary-menu')
      const authButton = screen.queryByTestId('auth-button')

      expect(desktopPrimaryMenu).toBeInTheDocument()
      expect(mobileHamburgerMenu).toBeInTheDocument()
      expect(desktopSecondaryMenu).toBeInTheDocument()
      expect(authButton).not.toBeInTheDocument()
    })
  })
  describe('Unauthenticated', () => {
    it('should be correctly rendered', () => {
      const component = render(withNextAuth(<Header />, 'unauthenticated'))

      expect(component.asFragment()).toMatchSnapshot()
    })

    it('should render a link to the website home page', () => {
      render(withNextAuth(<Header />, 'unauthenticated'))

      const homeLink = screen.getByTestId('home-anchor')

      expect(homeLink).toBeInTheDocument()
    })

    it('should render DesktopPrimaryMenu, MobileHamburgerMenu and AuthButton', () => {
      render(withNextAuth(<Header />, 'unauthenticated'))

      const desktopPrimaryMenu = screen.getByTestId('desktop-primary-menu')
      const mobileHamburgerMenu = screen.getByTestId('mobile-hamburger-menu')
      const desktopSecondaryMenu = screen.queryByTestId(
        'desktop-secondary-menu',
      )
      const authButton = screen.getByTestId('auth-button')

      expect(desktopPrimaryMenu).toBeInTheDocument()
      expect(mobileHamburgerMenu).toBeInTheDocument()
      expect(desktopSecondaryMenu).not.toBeInTheDocument()
      expect(authButton).toBeInTheDocument()
    })
  })
})
