import { fireEvent, render, screen } from '~/utils/tests/react-testing-library'
import { withNextAuth } from '~/utils/tests/with-next-auth'

import { MOBILE_MENU_OPTIONS } from '../../header.constants'
import { MobileHamburgerMenu } from './mobile-hambuger-menu.component'

describe('Header MobileHamburgerMenu Component', () => {
  describe('Authenticated', () => {
    it('should be correctly rendered', () => {
      const component = render(
        withNextAuth(<MobileHamburgerMenu />, 'authenticated'),
      )

      expect(component.asFragment()).toMatchSnapshot()
    })

    it('should be visible only on mobile', () => {
      render(withNextAuth(<MobileHamburgerMenu />, 'authenticated'))

      const component = screen.getByTestId('mobile-hamburger-menu')

      expect(component).toHaveClass('md:hidden')
      expect(component).not.toHaveClass('hidden')
    })

    it('should initially render only the popover button', () => {
      render(withNextAuth(<MobileHamburgerMenu />, 'authenticated'))

      expect(screen.getByTestId('popover-button')).toBeInTheDocument()
      expect(screen.queryByTestId('popover-panel')).not.toBeInTheDocument()
    })

    it('should render popover panel when popover button is clicked', () => {
      render(withNextAuth(<MobileHamburgerMenu />, 'authenticated'))

      fireEvent.click(screen.getByTestId('popover-button'))

      expect(screen.queryByTestId('popover-panel')).toBeInTheDocument()
    })

    it('should render all MOBILE_MENU_OPTIONS menus inside popover panel', () => {
      render(withNextAuth(<MobileHamburgerMenu />, 'authenticated'))

      fireEvent.click(screen.getByTestId('popover-button'))
      const panel = screen.queryByTestId('popover-panel')

      for (const { label } of MOBILE_MENU_OPTIONS.filter(
        ({ isAuthRequired }) => !isAuthRequired,
      )) {
        expect(panel?.innerHTML).toContain(label)
      }
    })
  })

  describe('Unauthenticated', () => {
    it('should be correctly rendered', () => {
      const component = render(
        withNextAuth(<MobileHamburgerMenu />, 'unauthenticated'),
      )

      expect(component.asFragment()).toMatchSnapshot()
    })

    it('should be visible only on mobile', () => {
      render(withNextAuth(<MobileHamburgerMenu />, 'unauthenticated'))

      const component = screen.getByTestId('mobile-hamburger-menu')

      expect(component).toHaveClass('md:hidden')
      expect(component).not.toHaveClass('hidden')
    })

    it('should initially render only the popover button', () => {
      render(withNextAuth(<MobileHamburgerMenu />, 'unauthenticated'))

      expect(screen.getByTestId('popover-button')).toBeInTheDocument()
      expect(screen.queryByTestId('popover-panel')).not.toBeInTheDocument()
    })

    it('should render popover panel when popover button is clicked', () => {
      render(withNextAuth(<MobileHamburgerMenu />, 'unauthenticated'))

      fireEvent.click(screen.getByTestId('popover-button'))

      expect(screen.queryByTestId('popover-panel')).toBeInTheDocument()
    })

    it('should render all MOBILE_MENU_OPTIONS that dont require authentication inside popover panel', () => {
      render(withNextAuth(<MobileHamburgerMenu />, 'authenticated'))

      fireEvent.click(screen.getByTestId('popover-button'))
      const panel = screen.queryByTestId('popover-panel')

      for (const { label } of MOBILE_MENU_OPTIONS.filter(
        ({ isAuthRequired }) => !isAuthRequired,
      )) {
        expect(panel?.innerHTML).toContain(label)
      }
    })
  })
})
