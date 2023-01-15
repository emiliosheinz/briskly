import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { getRandomFileName, getS3UploadURL } from '~/server/common/s3'

export const filesRouter = createTRPCRouter({
  getFileUploadConfig: protectedProcedure.mutation(async () => {
    const fileName = getRandomFileName()
    const uploadUrl = await getS3UploadURL(fileName)

    return {
      uploadUrl,
      fileName,
    }
  }),
})
