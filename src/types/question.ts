export type QuestionContents = SelectTypeQuestion | SortTypeQuestion

export type SelectTypeQuestion = {
  type: 'select'
  questions: {
    id: number
    label: string
  }[]
  answerId: number
  thumbnailUrl?: string
}

export type SortTypeQuestion = {
  type: 'sort'
  questions: {
    id: number
    label: string
    order: number
  }[]
  thumbnailUrl?: string
}

export const getSelectTypeInit = (): SelectTypeQuestion => ({
  type: 'select',
  thumbnailUrl: '',
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
  thumbnailUrl: '',
  questions: [
    {
      id: 1,
      label: '要素',
      order: 1,
    },
  ],
})
