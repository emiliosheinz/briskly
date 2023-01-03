import { render, screen } from '~/utils/tests/react-testing-library'
import { Input } from './input.component'

describe('Input Component', () => {
  it('should be correctly rendered', () => {
    const component = render(<Input id='mock' label='Label' />)

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should be correctly rendered when hasError', () => {
    const component = render(
      <Input id='mock' label='Label' error='Mocked Error' />,
    )

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should be correctly rendered when disabled', () => {
    const component = render(<Input disabled id='mock' label='Label' />)

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should show input label', () => {
    render(<Input id='mock' label='Label' />)

    const label = screen.getByText('Label')

    expect(label).toBeInTheDocument()
  })

  it('should show input error', () => {
    render(<Input id='mock' label='Label' error='Mocked Error' />)

    const error = screen.getByText('Mocked Error')

    expect(error).toBeInTheDocument()
  })

  it('should disable input when disabled is provided', () => {
    render(<Input disabled id='mock' label='Label' error='Mocked Error' />)

    const input = screen.getByTestId('briskly-custom-input')

    expect(input).toBeDisabled()
  })
})
