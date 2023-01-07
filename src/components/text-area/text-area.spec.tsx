import { render, screen } from '~/utils/tests/react-testing-library'

import { TextArea } from './text-area.component'

describe('TextArea Component', () => {
  it('should be correctly rendered', () => {
    const component = render(<TextArea id='mock' label='Label' />)

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should be correctly rendered when hasError', () => {
    const component = render(
      <TextArea id='mock' label='Label' error='Mocked Error' />,
    )

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should be correctly rendered when disabled', () => {
    const component = render(<TextArea disabled id='mock' label='Label' />)

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should show input label', () => {
    render(<TextArea id='mock' label='Label' />)

    const label = screen.getByText('Label')

    expect(label).toBeInTheDocument()
  })

  it('should show input error', () => {
    render(<TextArea id='mock' label='Label' error='Mocked Error' />)

    const error = screen.getByText('Mocked Error')

    expect(error).toBeInTheDocument()
  })

  it('should disable input when disabled is provided', () => {
    render(<TextArea disabled id='mock' label='Label' error='Mocked Error' />)

    const input = screen.getByTestId('briskly-custom-textarea')

    expect(input).toBeDisabled()
  })

  it('should have 5 rows as default', () => {
    render(<TextArea id='mock' label='Label' />)

    const input = screen.getByTestId('briskly-custom-textarea')

    expect(input.getAttribute('rows')).toBe('5')
  })
})
