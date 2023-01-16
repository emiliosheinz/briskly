import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
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

export function getS3ImageUrl(key: string) {
  return `${env.AWS_CLOUD_FRONT_URL}/${key}`
}

export function getRandomFileName() {
  const rawBytes = randomBytes(16)
  return rawBytes.toString('hex')
}
