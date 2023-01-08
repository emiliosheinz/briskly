import React, { useState } from 'react'

import { DocumentPlusIcon } from '@heroicons/react/24/outline'

import { useFilePreview } from '~/hooks/use-file-preview'

import { Image } from '../image/image.component'
import type { ImageUploaderProps } from './image-uploader.types'

export const ImageUploader = React.forwardRef<
  HTMLInputElement,
  ImageUploaderProps
>(function ImageUploader(props, ref) {
  const { id, onChange, ...otherProps } = props

  const [image, setImage] = useState<File>()
  const previewImage = useFilePreview(image)

  const renderIconAndImageTypes = () => {
    if (!!previewImage) return null

    return (
      <div className='flex flex-col items-center justify-center gap-2'>
        <DocumentPlusIcon className='h-10 w-10' />
        <p className='text-center text-xs'>
          PNG, JPG, JPEG
          <br />
        </p>
      </div>
    )
  }

  const renderPreviewImage = () => {
    if (!previewImage) return null

    return (
      <Image fill alt='Alt' src={previewImage} style={{ objectFit: 'cover' }} />
    )
  }

  const customOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0])
    onChange?.(e)
  }

  return (
    <label
      htmlFor={id}
      className='relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md p-5 ring-1 ring-primary-500 hover:ring-2 hover:ring-primary-900 sm:aspect-auto sm:w-1/3'
    >
      {renderIconAndImageTypes()}
      {renderPreviewImage()}
      <input
        id={id}
        ref={ref}
        type='file'
        accept='image/png, image/jpeg, image/jpg'
        className='hidden'
        onChange={customOnChange}
        {...otherProps}
      />
    </label>
  )
})
