import { faker } from '@faker-js/faker'

import { render, screen } from '~/utils/tests/react-testing-library'

import { Image } from './image.component'

const makeImageUrl = () => faker.image.abstract()
const defaultAlt = 'Fake image for testing purpose'

describe('Image Component', () => {
  it('should render a HTML image tag', () => {
    const src = makeImageUrl()

    render(<Image src={src} alt={defaultAlt} height={80} width={80} />)
    const component = screen.getByTestId('image-component')

    expect(component.outerHTML.startsWith('<img')).toBe(true)
  })

  it('should provide blur placeholder', () => {
    const src = makeImageUrl()

    render(<Image src={src} alt={defaultAlt} height={80} width={80} />)
    const component = screen.getByTestId('image-component')

    const actualStyle = component.getAttribute('style')
    const blurStyle =
      'color: transparent; background-size: cover; background-position: 50% 50%; background-repeat: no-repeat;'

    expect(actualStyle).toEqual(blurStyle)
  })

  it('should not render blur placeholder when image width is smaller then 40', () => {
    const src = makeImageUrl()

    render(<Image src={src} alt={defaultAlt} height={40} width={39} />)
    const component = screen.getByTestId('image-component')

    const actualStyle = component.getAttribute('style')
    const defaultStyle = 'color: transparent;'

    expect(actualStyle).toEqual(defaultStyle)
  })

  it('should not render blur placeholder when image height is smaller then 40', () => {
    const src = makeImageUrl()

    render(<Image src={src} alt={defaultAlt} height={39} width={40} />)
    const component = screen.getByTestId('image-component')

    const actualStyle = component.getAttribute('style')
    const defaultStyle = 'color: transparent;'

    expect(actualStyle).toEqual(defaultStyle)
  })
})
