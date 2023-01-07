import { render, screen } from '~/utils/tests/react-testing-library'

import { Loader, variantBasedClassName } from './loader.component'

describe('Loader Component', () => {
  it('should be correctly rendered', () => {
    const component = render(<Loader />)

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should apply the secondary variant style as default', () => {
    render(<Loader />)

    const loaderItems = screen.getByTestId('loader').querySelectorAll('span')

    for (const item of loaderItems) {
      expect(item).toHaveClass(variantBasedClassName.secondary)
    }
  })

  it('should apply the primary variant style', () => {
    render(<Loader variant='primary' />)

    const loaderItems = screen.getByTestId('loader').querySelectorAll('span')

    for (const item of loaderItems) {
      expect(item).toHaveClass(variantBasedClassName.primary)
    }
  })

  it('should apply the secondary variant style', () => {
    render(<Loader variant='secondary' />)

    const loaderItems = screen.getByTestId('loader').querySelectorAll('span')

    for (const item of loaderItems) {
      expect(item).toHaveClass(variantBasedClassName.secondary)
    }
  })

  it('should apply the bad variant style', () => {
    render(<Loader variant='bad' />)

    const loaderItems = screen.getByTestId('loader').querySelectorAll('span')

    for (const item of loaderItems) {
      expect(item).toHaveClass(variantBasedClassName.bad)
    }
  })
})
