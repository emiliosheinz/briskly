import React, { useState } from 'react'

import { DocumentPlusIcon } from '@heroicons/react/24/outline'

import { useFilePreview } from '~/hooks/use-file-preview'
import { classNames } from '~/utils/css'
import { compress } from '~/utils/image'

import { Image } from '../image/image.component'
import type { ImageUploaderProps } from './image-uploader.types'

export const ImageUploader = React.forwardRef<
  HTMLInputElement,
  ImageUploaderProps
>(function ImageUploader(props, ref) {
  const { id, onChange, error: errorProp, defaultValue, ...otherProps } = props

  const [image, setImage] = useState<File | null>()
  const [innerError, setInnerError] = useState<string>('')
  const previewImage = useFilePreview(image) || defaultValue

  const error = errorProp || innerError

  const renderIconAndImageTypes = () => {
    if (!!previewImage) return null

    return (
      <div
        data-testid='img-uploader-icon-and-image-types'
        className='flex flex-col items-center justify-center gap-2'
      >
        <DocumentPlusIcon className='h-10 w-10' />
        <p className='text-center text-xs'>
          PNG, JPG, JPEG ou WEBP
          <br />
          preferencialmente quadrada
        </p>
      </div>
    )
  }

  const renderPreviewImage = () => {
    if (!previewImage) return null

    return (
      <Image
        fill
        data-testid='img-uploader-preview-image'
        alt='Preview image'
        src={previewImage}
        style={{ objectFit: 'cover' }}
      />
    )
  }

  const customOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInnerError('')
    setImage(null)

    const result = await compress(e.target.files?.[0])

    if (result && result.size * 0.001 > 250) {
      setInnerError('A imagem não pode ter mais que 250KB')
      return
    }

    setImage(result)
    onChange?.(e)
  }

  return (
    <div className='flex w-full flex-col'>
      <label
        htmlFor={id}
        className={classNames(
          'relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-md p-5 ring-1 hover:ring-2',
          error
            ? 'hover:ring-primary-700 ring-error-700'
            : 'ring-primary-500 hover:ring-primary-900',
        )}
      >
        {renderIconAndImageTypes()}
        {renderPreviewImage()}
        <input
          hidden
          id={id}
          ref={ref}
          type='file'
          onChange={customOnChange}
          data-testid='img-uploader-input'
          accept='.png, .jpeg, .jpg, .webp'
          {...otherProps}
        />
      </label>
      <p className='mt-1 h-5 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-error-700'>
        {error}
      </p>
    </div>
  )
})
