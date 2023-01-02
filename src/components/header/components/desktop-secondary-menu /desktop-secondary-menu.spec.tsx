import { fireEvent, render, screen } from '~/utils/tests/react-testing-library'
import { withNextAuth } from '~/utils/tests/with-next-auth'

import { DESKTOP_MENU_OPTIONS } from '../../header.constants'
import { DesktopSecondaryMenu } from './desktop-secondary-menu.component'

describe('Header DesktopSecondaryMenu Component', () => {
  it('should be correctly rendered', () => {
    const component = render(<DesktopSecondaryMenu />)

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should only be visible on Desktop', () => {
    render(<DesktopSecondaryMenu />)

    expect(screen.getByTestId('desktop-secondary-menu')).toHaveClass('hidden')
    expect(screen.getByTestId('desktop-secondary-menu')).toHaveClass('md:block')
  })

  it('should initially render only the popover button', () => {
    render(<DesktopSecondaryMenu />)

    expect(screen.getByTestId('popover-button')).toBeInTheDocument()
    expect(screen.queryByTestId('popover-panel')).not.toBeInTheDocument()
  })

  it('should render popover panel when popover button is clicked', () => {
    render(withNextAuth(<DesktopSecondaryMenu />, 'authenticated'))

    fireEvent.click(screen.getByTestId('popover-button'))

    expect(screen.queryByTestId('popover-panel')).toBeInTheDocument()
  })

  it('should render all DESKTOP_MENU_OPTIONS.SECONDARY menus inside popover panel', () => {
    render(withNextAuth(<DesktopSecondaryMenu />, 'authenticated'))

    fireEvent.click(screen.getByTestId('popover-button'))
    const panel = screen.queryByTestId('popover-panel')

    for (const { label } of DESKTOP_MENU_OPTIONS.SECONDARY) {
      expect(panel?.innerHTML).toContain(label)
    }
  })
})
