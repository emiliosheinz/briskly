import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomBytes } from 'node:crypto'

import { env } from '~/env/server.mjs'

function getAwsS3Client() {
  return new S3Client({
    region: env.AWS_S3_REGION,
    credentials: {
      accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
    },
  })
}

export async function getS3UploadURL(key: string) {
  const command = new PutObjectCommand({
    Key: key,
    Bucket: env.AWS_S3_BUCKET,
    ContentType: 'image/jpg',
  })

  return getSignedUrl(getAwsS3Client(), command, { expiresIn: 30 })
}

export async function deleteObjectFromS3(key: string) {
  const command = new DeleteObjectCommand({
    Key: key,
    Bucket: env.AWS_S3_BUCKET,
  })

  return getAwsS3Client().send(command)
}

export function getS3ImageUrl(key: string) {
  return `${env.AWS_CLOUD_FRONT_URL}/${key}`
}

export function getKeyFromS3Url(url: string) {
  return url.replace(`${env.AWS_CLOUD_FRONT_URL}/`, '')
}

export function getRandomFileName() {
  const rawBytes = randomBytes(16)
  return rawBytes.toString('hex')
}
