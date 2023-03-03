export type QuestionContents = SelectTypeQuestion | SortTypeQuestion

export type SelectTypeQuestion = {
  type: 'select'
  questions: {
    id: number
    label: string
    thumbnailUrl?: string
  }[]
  answerId: number
}

export type SortTypeQuestion = {
  type: 'sort'
  questions: {
    id: number
    label: string
    thumbnailUrl?: string
  }[]
  answerIds: number[]
}

export const getSelectTypeInit = (): SelectTypeQuestion => ({
  type: 'select',
  questions: [
    {
      id: 1,
      label: '選択肢',
    },
  ],
  answerId: 1,
})

export const getSortTypeInit = (): SortTypeQuestion => ({
  type: 'sort',
  questions: [
    {
      id: 1,
      label: '要素',
    },
  ],
  answerIds: [1],
})
