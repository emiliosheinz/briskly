import { render, screen } from '~/utils/tests/react-testing-library'

import {
  Button,
  fullWidthClassNames,
  variantBasedClassNames,
} from './button.component'

describe('Button Component', () => {
  describe('Primary', () => {
    it('should be correctly rendered', () => {
      const component = render(<Button variant='primary'>Default Label</Button>)

      expect(component.asFragment()).toMatchSnapshot()
    })

    it('should apply the primary classNames', () => {
      render(<Button variant='primary'>Default Label</Button>)

      const button = screen.getByTestId('briskly-custom-button')
      const primaryClassNames = variantBasedClassNames.primary

      expect(button).toHaveClass(primaryClassNames)
    })

    it('should use the primary variant as default', () => {
      render(<Button>Default Label</Button>)

      const button = screen.getByTestId('briskly-custom-button')
      const primaryClassNames = variantBasedClassNames.primary

      expect(button).toHaveClass(primaryClassNames)
    })

    it('should properly render the provided label', () => {
      const providedLabel = 'Label'
      render(<Button variant='primary'>{providedLabel}</Button>)

      const button = screen.getByText(providedLabel)

      expect(button).toBeInTheDocument()
    })

    it('should apply the fullWidth classnames when fullWidth prop is provided', () => {
      render(
        <Button variant='primary' fullWidth>
          Default Label
        </Button>,
      )

      const button = screen.getByTestId('briskly-custom-button')

      expect(button).toHaveClass(fullWidthClassNames)
    })

    it('should render loader when isLoading is true', () => {
      render(
        <Button variant='primary' isLoading>
          Default Label
        </Button>,
      )

      const loader = screen.getByTestId('button-loader')

      expect(loader).toBeInTheDocument()
    })

    it('should not render loader when isLoading is false', () => {
      render(<Button variant='primary'>Default Label</Button>)

      const loader = screen.queryByTestId('button-loader')

      expect(loader).not.toBeInTheDocument()
    })

    it('should disable the button when isLoading is true', () => {
      render(
        <Button variant='primary' isLoading>
          Default Label
        </Button>,
      )

      const button = screen.getByTestId('briskly-custom-button')

      expect(button).toBeDisabled()
    })

    it('should disable the button when disabled is true', () => {
      render(
        <Button variant='primary' disabled>
          Default Label
        </Button>,
      )

      const button = screen.getByTestId('briskly-custom-button')

      expect(button).toBeDisabled()
    })
  })

  describe('Secondary', () => {
    it('should be correctly rendered', () => {
      const component = render(
        <Button variant='secondary'>Default Label</Button>,
      )

      expect(component.asFragment()).toMatchSnapshot()
    })

    it('should apply the secondary classNames', () => {
      render(<Button variant='secondary'>Default Label</Button>)

      const button = screen.getByTestId('briskly-custom-button')
      const primaryClassNames = variantBasedClassNames.secondary

      expect(button).toHaveClass(primaryClassNames)
    })

    it('should properly render the provided label', () => {
      const providedLabel = 'Label'
      render(<Button variant='secondary'>{providedLabel}</Button>)

      const button = screen.getByText(providedLabel)

      expect(button).toBeInTheDocument()
    })

    it('should apply the fullWidth classnames when fullWidth prop is provided', () => {
      render(
        <Button variant='secondary' fullWidth>
          Default Label
        </Button>,
      )

      const button = screen.getByTestId('briskly-custom-button')

      expect(button).toHaveClass(fullWidthClassNames)
    })

    it('should render loader when isLoading is true', () => {
      render(
        <Button variant='secondary' isLoading>
          Default Label
        </Button>,
      )

      const loader = screen.getByTestId('button-loader')

      expect(loader).toBeInTheDocument()
    })

    it('should not render loader when isLoading is false', () => {
      render(<Button variant='secondary'>Default Label</Button>)

      const loader = screen.queryByTestId('button-loader')

      expect(loader).not.toBeInTheDocument()
    })

    it('should disable the button when isLoading is true', () => {
      render(
        <Button variant='secondary' isLoading>
          Default Label
        </Button>,
      )

      const button = screen.getByTestId('briskly-custom-button')

      expect(button).toBeDisabled()
    })

    it('should disable the button when disabled is true', () => {
      render(
        <Button variant='secondary' disabled>
          Default Label
        </Button>,
      )

      const button = screen.getByTestId('briskly-custom-button')

      expect(button).toBeDisabled()
    })
  })

  describe('Bad', () => {
    it('should be correctly rendered', () => {
      const component = render(<Button variant='bad'>Default Label</Button>)

      expect(component.asFragment()).toMatchSnapshot()
    })

    it('should apply the bad classNames', () => {
      render(<Button variant='bad'>Default Label</Button>)

      const button = screen.getByTestId('briskly-custom-button')
      const primaryClassNames = variantBasedClassNames.bad

      expect(button).toHaveClass(primaryClassNames)
    })

    it('should properly render the provided label', () => {
      const providedLabel = 'Label'
      render(<Button variant='bad'>{providedLabel}</Button>)

      const button = screen.getByText(providedLabel)

      expect(button).toBeInTheDocument()
    })

    it('should apply the fullWidth classnames when fullWidth prop is provided', () => {
      render(
        <Button variant='bad' fullWidth>
          Default Label
        </Button>,
      )

      const button = screen.getByTestId('briskly-custom-button')

      expect(button).toHaveClass(fullWidthClassNames)
    })

    it('should render loader when isLoading is true', () => {
      render(
        <Button variant='bad' isLoading>
          Default Label
        </Button>,
      )

      const loader = screen.getByTestId('button-loader')

      expect(loader).toBeInTheDocument()
    })

    it('should not render loader when isLoading is false', () => {
      render(<Button variant='bad'>Default Label</Button>)

      const loader = screen.queryByTestId('button-loader')

      expect(loader).not.toBeInTheDocument()
    })

    it('should disable the button when isLoading is true', () => {
      render(
        <Button variant='bad' isLoading>
          Default Label
        </Button>,
      )

      const button = screen.getByTestId('briskly-custom-button')

      expect(button).toBeDisabled()
    })

    it('should disable the button when disabled is true', () => {
      render(
        <Button variant='bad' disabled>
          Default Label
        </Button>,
      )

      const button = screen.getByTestId('briskly-custom-button')

      expect(button).toBeDisabled()
    })
  })
})
