import { render, screen } from '~/utils/tests/react-testing-library'

import { DESKTOP_MENU_OPTIONS } from '../../header.constants'
import { DesktopPrimaryMenu } from './desktop-primary-menu.component'

describe('Header DesktopPrimaryMenu Component', () => {
  it('should be correctly rendered', () => {
    const component = render(<DesktopPrimaryMenu />)

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should only be visible on desktop', async () => {
    render(<DesktopPrimaryMenu />)

    expect(screen.getByTestId('desktop-primary-menu')).toHaveClass('md:flex')
    expect(screen.getByTestId('desktop-primary-menu')).toHaveClass('hidden')
  })

  it('should render all DESKTOP_MENU_OPTIONS.PRIMARY menus', async () => {
    render(<DesktopPrimaryMenu />)

    for (const item of DESKTOP_MENU_OPTIONS.PRIMARY) {
      expect(screen.getByText(item.label)).toBeInTheDocument()
    }
  })
})
