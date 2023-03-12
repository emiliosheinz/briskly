/**
 * !DO NO USE THIS FILE IN THE CLIENT SIDE
 */
import calculateSimilarity from 'compute-cosine-similarity'
import { Configuration, OpenAIApi } from 'openai'

import type {
  CardInput,
  TopicInput,
} from '~/contexts/create-new-deck/create-new-deck.types'
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
      timeout: 15_000,
    },
  )

const trimAndRemoveDoubleQuotes = (str: string) =>
  str.trim().replaceAll('"', '')

/**
 * Embed both strings with text-embedding-ada-002 and calculate their distance with cosine similarity
 * Reference: https://platform.openai.com/docs/guides/embeddings/limitations-risks
 */
export async function verifyStringsSimilarity(str1: string, str2: string) {
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

type GenerateFlashCardsParam = {
  topics: Array<TopicInput>
  title: string
}

export async function generateFlashCards({
  topics,
  title,
}: GenerateFlashCardsParam): Promise<Array<CardInput>> {
  const amountOfCards = 3
  const charactersPerSentence = 65

  /** Build topics strings */
  const joinedTopics = topics.map(({ title }) => title).join(', ')

  /** Build prompt asking OpenAI to generate a csv string */
  const prompt = `Levando em conta o contexto ${title}, gere um Array JSON com ${amountOfCards} perguntas e respostas curtas e diretas, de no máximo ${charactersPerSentence} caracteres, sobre ${joinedTopics}. [{question: "pergunta", answer: "resposta"}, ...]`

  const response = await openai.createChatCompletion(
    {
      n: 1,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      model: 'gpt-3.5-turbo',
      /**
       * For some reason when trying to correctly calculate the amount of tokens
       * the API returns some strange results.
       */
      max_tokens: amountOfCards * charactersPerSentence,
    },
    { timeout: 15_000 },
  )

  const generatedJson = JSON.parse(
    response.data.choices[0]?.message?.content ?? '[]',
  )

  const cards: Array<CardInput> = generatedJson.map(
    ({ question, answer }: { question: string; answer: string }) => ({
      question: trimAndRemoveDoubleQuotes(question),
      answer: trimAndRemoveDoubleQuotes(answer),
      isAiPowered: true,
    }),
  )

  return cards
}
