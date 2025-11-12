'use client'

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
      <div className="flex h-full w-full items-center justify-center">
        <progress className="progress progress-primary w-48" />
      </div>
    )
  }

  const contents = question.contents as QuestionContents

  return (
    <form className="flex h-full flex-col gap-6 overflow-y-auto text-white">
      <div>
        <label className="text-xs uppercase tracking-[0.4em] text-slate-300">問題文</label>
        <input
          className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-lg text-white focus:border-amber-300 focus:outline-none"
          value={question.title}
          type="text"
          placeholder="例) 日本一高い山は？"
          onChange={(e) =>
            handleChangeSelectedQuestion({ title: e.target.value })
          }
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.4em] text-slate-300">問題タイプ</label>
        <select
          className="mt-2 w-full rounded-2xl border border-white/20 px-4 py-3 text-lg text-black"
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
          <option value="select">選択問題</option>
          <option value="sort">並べ替え問題</option>
        </select>
      </div>
      <div className="flex-1">
        <label className="text-xs uppercase tracking-[0.4em] text-slate-300">内容</label>
        <div className="mt-2">
          <QuestionFormContents
            contents={contents}
            handleSave={(contents) => {
              handleChangeSelectedQuestion({ contents })
            }}
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        <button
          className="btn border-0 bg-gradient-to-r from-emerald-400 to-sky-500 text-slate-900"
          type="button"
          onClick={() => {
            Promise.resolve(handleSaveSelectedQuestion()).catch((error) => console.error(error))
          }}
        >
          保存
        </button>
        <button
          className="btn border-0 bg-rose-500/80 text-white"
          type="button"
          onClick={() => {
            Promise.resolve(handleDeleteQuestion()).catch((error) => console.error(error))
          }}
        >
          削除
        </button>
      </div>
    </form>
  )
}
