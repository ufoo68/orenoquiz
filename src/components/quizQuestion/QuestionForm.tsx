import type { QuizQuestion } from '@prisma/client'

import type { FC } from 'react'
import type { QuestionContents } from '../../types/question'
import { getSelectTypeInit, getSortTypeInit } from '../../types/question'
import { QuestionFormContents } from './QuestionFormContents'

type Props = {
  question: QuizQuestion | undefined
  handleChangeSelectedQuestion: (params: Partial<QuizQuestion>) => void
  handleSaveSelectedQuestion: () => void
  handleDeleteQuestion: () => void
}

export const QuestionForm: FC<Props> = ({
  question,
  handleChangeSelectedQuestion,
  handleSaveSelectedQuestion,
  handleDeleteQuestion,
}) => {
  if (!question) {
    return (
      <div className="w-11/12">
        <progress className="progress" />
      </div>
    )
  }

  const contents = question.contents as QuestionContents

  return (
    <form className="max-h-[90vh] w-3/4 overflow-y-scroll rounded bg-white p-8 shadow-md">
      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          問題文
        </label>
        <input
          className="input-bordered input w-full"
          value={question.title}
          type="text"
          onChange={(e) =>
            handleChangeSelectedQuestion({ title: e.target.value })
          }
        />
        <label className="mb-2 block text-sm font-bold text-gray-700">
          問題タイプ
        </label>
        <select
          className="select-bordered select w-full"
          value={contents.type}
          onChange={(e) => {
            const type = e.target.value
            if (type === 'select') {
              handleChangeSelectedQuestion({ contents: getSelectTypeInit() })
            } else if (type === 'sort') {
              handleChangeSelectedQuestion({ contents: getSortTypeInit() })
            }
          }}
        >
          <option value="select">選択</option>
          <option value="sort">並べ替え</option>
        </select>
        <label className="mb-2 block text-sm font-bold text-gray-700">
          内容
        </label>
        <QuestionFormContents
          contents={contents}
          handleSave={(contents) => {
            handleChangeSelectedQuestion({ contents })
          }}
        />
      </div>
      <div className="flex justify-end space-x-5">
        <button
          className="btn-primary btn"
          type="button"
          onClick={handleSaveSelectedQuestion}
        >
          保存
        </button>
        <button
          className="btn-secondary btn"
          type="button"
          onClick={handleDeleteQuestion}
        >
          削除
        </button>
      </div>
    </form>
  )
}
