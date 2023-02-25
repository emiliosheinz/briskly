import calculateSimilarity from 'compute-cosine-similarity'
import { Configuration, OpenAIApi } from 'openai'

import { env } from '~/env/server.mjs'

import { isServerSide } from '../runtime'

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const createEmbedding = (str: string) =>
  openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: str.replace('\n', ' '),
  })

/**
 * Embed both strings with text-embedding-ada-002 and calculate their distance with cosine similarity
 * Reference: https://platform.openai.com/docs/guides/embeddings/limitations-risks
 */
export async function verifyStringsSimilarity(str1: string, str2: string) {
  if (!isServerSide()) {
    throw new Error('Function can only be called server-side.')
  }

  const [firstStringResponse, secondStringResponse] = await Promise.all([
    createEmbedding(str1),
    createEmbedding(str2),
  ])

  const firstResult = firstStringResponse.data.data[0]?.embedding
  const secondResult = secondStringResponse.data.data[0]?.embedding

  if (!firstResult || !secondResult) {
    throw new Error('Could not calculate similarity. No results where found.')
  }

  const similarity = calculateSimilarity(firstResult, secondResult)

  return similarity
}
