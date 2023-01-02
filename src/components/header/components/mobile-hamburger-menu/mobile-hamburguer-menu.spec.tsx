import { fireEvent, render, screen } from '~/utils/tests/react-testing-library'
import { withNextAuth } from '~/utils/tests/with-next-auth'

import { MOBILE_MENU_OPTIONS } from '../../header.constants'
import { MobileHamburgerMenu } from './mobile-hambuger-menu.component'

describe('Header MobileHamburgerMenu Component', () => {
  it('should be correctly rendered', () => {
    const component = render(<MobileHamburgerMenu />)

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should be visible only on mobile', () => {
    render(<MobileHamburgerMenu />)

    const component = screen.getByTestId('mobile-hamburger-menu')

    expect(component).toHaveClass('md:hidden')
    expect(component).not.toHaveClass('hidden')
  })

  it('should initially render only the popover button', () => {
    render(<MobileHamburgerMenu />)

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

    for (const { label } of MOBILE_MENU_OPTIONS) {
      expect(panel?.innerHTML).toContain(label)
    }
  })
})
