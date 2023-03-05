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
  openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: str.replace('\n', ' '),
  })

const trimAndRemoveDoubleQuotes = (str: string) =>
  str.trim().replace(/^"(.+(?="$))"$/, '$1')

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
}

export async function generateFlashCards({
  topics,
}: GenerateFlashCardsParam): Promise<Array<CardInput>> {
  /** Created to possibly use as params in the future */
  const amountOfCards = 3
  const tokensPerCard = 40

  /** Build topics strings */
  const joinedTopics = topics.map(({ title }) => title).join(', ')

  /** Build prompt asking OpenAI to generate a csv string */
  const prompt = `Gere um csv com ${amountOfCards} perguntas e respostas curtas sobre: ${joinedTopics}.`

  const response = await openai.createCompletion({
    n: 1,
    prompt,
    temperature: 0.8,
    model: 'text-davinci-003',
    max_tokens: amountOfCards * tokensPerCard,
  })

  const generatedText = response.data.choices[0]?.text

  if (!generatedText) {
    throw new Error('Could not generate questions and answers')
  }

  /** Get CSV lines and remove first line which is the CSV header */
  const separator = ','
  const lines = generatedText.split('\n').filter(Boolean)
  const questionsAndAnswers = lines.slice(1, lines.length)

  const cards: Array<CardInput> = questionsAndAnswers.map(content => {
    const [question = '', answer = ''] = content.split(separator)

    return {
      question: trimAndRemoveDoubleQuotes(question),
      answer: trimAndRemoveDoubleQuotes(answer),
      isAiPowered: true,
    }
  })

  return cards
}
