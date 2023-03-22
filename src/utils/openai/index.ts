/**
 * !DO NO USE THIS FILE IN THE CLIENT SIDE
 */
import calculateSimilarity from 'compute-cosine-similarity'
import { Configuration, OpenAIApi } from 'openai'

import { MINIMUM_ACCEPTED_SIMILARITY } from '~/constants'
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
      timeout: 10_000,
    },
  )

const trimAndRemoveDoubleQuotes = (str: string) =>
  str.trim().replaceAll('"', '')

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

type GenerateFlashCardsParam = {
  topics: Array<TopicInput>
  title: string
}

export async function generateFlashCards({
  topics,
  title,
}: GenerateFlashCardsParam): Promise<Array<CardInput>> {
  let generatedJsonString: string | undefined

  try {
    const amountOfCards = 3
    const charactersPerSentence = 65

    /** Selects one random topic from the list of topics  */
    const randomTopic = topics[Math.floor(Math.random() * topics.length)]

    /** Build prompt asking OpenAI to generate a csv string */
    const prompt = `Levando em conta o contexto ${title}, gere um Array JSON de tamanho ${amountOfCards} com perguntas e respostas curtas e diretas, de no máximo ${charactersPerSentence} caracteres, sobre ${randomTopic}. [{question: "pergunta", answer: "resposta"}, ...]`

    const response = await openai.createChatCompletion(
      {
        n: 1,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        model: 'gpt-3.5-turbo',
        max_tokens: amountOfCards * charactersPerSentence,
      },
      { timeout: 30_000 },
    )

    generatedJsonString = response.data.choices[0]?.message?.content

    if (!generatedJsonString) {
      throw new Error('Não foi possível gerar as perguntas e respostas.')
    }

    const generatedJson = JSON.parse(generatedJsonString)

    const cards: Array<CardInput> = generatedJson.map(
      ({ question, answer }: { question: string; answer: string }) => ({
        question: trimAndRemoveDoubleQuotes(question),
        validAnswers: trimAndRemoveDoubleQuotes(answer),
        isAiPowered: true,
      }),
    )

    return cards
  } catch (error) {
    /**
     * Added to improve error tracking on log monitoring tools
     */
    console.error(error, generatedJsonString)
    throw error
  }
}
