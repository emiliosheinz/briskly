import { faker } from '@faker-js/faker'

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '~/utils/tests/react-testing-library'

import { ImageUploader } from './image-uploader.component'

jest.mock('~/hooks/use-file-preview', () => ({
  useFilePreview: (file?: File) => (file ? faker.internet.url() : ''),
}))

const makeFile = () =>
  new File(faker.random.words(10).split(' '), faker.random.word(), {
    type: 'image/png',
  })

describe('ImageUploader Component', () => {
  it('should be properly rendered', () => {
    const component = render(<ImageUploader id='id' />)

    expect(component.asFragment()).toMatchSnapshot()
  })

  it('should not show preview', () => {
    render(<ImageUploader id='id' />)

    const preview = screen.queryByTestId('img-uploader-preview-image')
    const iconAndImageTypes = screen.getByTestId(
      'img-uploader-icon-and-image-types',
    )

    expect(preview).not.toBeInTheDocument()
    expect(iconAndImageTypes).toBeInTheDocument()
  })

  it('should show preview when image is selected', async () => {
    const file = makeFile()

    render(<ImageUploader id='id' />)

    const imageInput = screen.getByTestId('img-uploader-input')

    await waitFor(() =>
      fireEvent.change(imageInput, {
        target: { files: [file] },
      }),
    )

    const preview = screen.getByTestId('img-uploader-preview-image')
    const iconAndImageTypes = screen.queryByTestId(
      'img-uploader-icon-and-image-types',
    )

    expect(preview).toBeInTheDocument()
    expect(iconAndImageTypes).not.toBeInTheDocument()
  })
})
