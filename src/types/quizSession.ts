export type QuizSessionState =
  | QuizSessionStateEntry
  | QuizSessonStateQuestion
  | QuizSessionStateAnswer

export type QuizSessionStateEntry = {
  type: 'entry'
}

export const getQuizSessionStateEntry = (): QuizSessionStateEntry => ({
  type: 'entry'
})

export type QuizSessonStateQuestion = {
  type: 'question'
  questionId: string
}

export const getQuizSessionStateQuestion = (questionId: string): QuizSessonStateQuestion  => ({
  type: 'question',
  questionId,
})

export type QuizSessionStateAnswer = {
  type: 'answer'
  questionId: string
}

export const getQuizSessionStateAnswer = (
  questionId: string
): QuizSessionStateAnswer => ({
  type: 'answer',
  questionId,
})