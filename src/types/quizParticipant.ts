export type QuizParticipantAnswer =
  | QuizParticipantAnswerSelect
  | QuizParticipantAnswerSort

export type QuizParticipantAnswerSelect = {
  type: 'select'
  answerId: number
}

export type QuizParticipantAnswerSort = {
  type: 'sort'
  answers: {
    id: number
    order: number
    label: string
  }[]
}
