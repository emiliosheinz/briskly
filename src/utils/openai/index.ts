/**
 * !DO NO USE THIS FILE IN THE CLIENT SIDE
 */
import calculateSimilarity from 'compute-cosine-similarity'
import { Configuration, OpenAIApi } from 'openai'

import { MINIMUM_ACCEPTED_SIMILARITY } from '~/constants'
import { env } from '~/env/server.mjs'

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const createEmbedding = (str: string) =>
  openai.createEmbedding(
    {
      model: 'text-embedding-ada-002',
      input: str.replace('\n', ' '),
    },
    {
      timeout: 10_000,
    },
  )

/**
 * Embed both strings with text-embedding-ada-002 and calculate their distance with cosine similarity
 * Reference: https://platform.openai.com/docs/guides/embeddings/limitations-risks
 */
export async function verifyIfAnswerIsRight(
  actualAnswer: string,
  validAnswers: Array<string>,
) {
  const [embedActualAnswer, ...validAnswersEmbeddings] = await Promise.all([
    createEmbedding(actualAnswer),
    ...validAnswers.map(answer => createEmbedding(answer)),
  ])

  const actualAnswerResult = embedActualAnswer.data.data[0]?.embedding
  const validAnswersResults = validAnswersEmbeddings
    .map(({ data }) => data.data[0]?.embedding)
    .filter(Boolean)

  if (!actualAnswerResult || validAnswersResults.length === 0) {
    throw new Error('Could not calculate similarity. No results where found.')
  }

  const isRight = validAnswersResults.some(validAnswerResult => {
    const similarity = calculateSimilarity(
      actualAnswerResult,
      validAnswerResult || [],
    )

    return similarity > MINIMUM_ACCEPTED_SIMILARITY
  })

  return isRight
}
