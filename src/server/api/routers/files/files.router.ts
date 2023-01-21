import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  deleteObjectFromS3,
  getKeyFromS3Url,
  getRandomFileName,
  getS3UploadURL,
} from '~/server/common/s3'

export const filesRouter = createTRPCRouter({
  getFileUploadConfig: protectedProcedure.mutation(async () => {
    const fileName = getRandomFileName()
    const uploadUrl = await getS3UploadURL(fileName)

    return {
      uploadUrl,
      fileName,
    }
  }),
  deleteFileByUrl: protectedProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input: { url } }) =>
      deleteObjectFromS3(getKeyFromS3Url(url)),
    ),
})
