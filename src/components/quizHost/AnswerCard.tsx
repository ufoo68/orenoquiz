'use client'

import type { QuizQuestion } from '@prisma/client'
import { sortBy } from 'lodash'
import type { FC } from 'react'
import { useState } from 'react'
import type { QuestionContents } from '../../types/question'
import { api } from '../../utils/api'

type Props = {
  sessionId: string
  questionId: string
  handleNextQuestion: (questionId: string) => void
  handleShowRank: () => void
}

export const AnswerCard: FC<Props> = ({
  questionId,
  sessionId,
  handleNextQuestion,
  handleShowRank,
}) => {
  const [question, setQuestion] = useState<QuizQuestion | null>()
  const [entriesCount, setEntriesCount] = useState<number>(0)
  const [winCount, setWinCount] = useState<number>(0)
  const [nextQuestionId, setNextQuestionId] = useState<string>()
  api.quizParticipant.getAllCount.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setEntriesCount(res)
      },
    }
  )
  api.quizQuestion.get.useQuery(
    { questionId },
    {
      onSuccess: (res) => {
        setQuestion(res)
      },
    }
  )
  api.quizParticipant.getQuestionWinCount.useQuery(
    { sessionId, questionId },
    {
      onSuccess: (res) => {
        setWinCount(res)
      },
    }
  )
  api.quizQuestion.getNextQuestionId.useQuery(
    {
      questionId,
    },
    {
      onSuccess: (res) => {
        setNextQuestionId(res)
      },
    }
  )
  if (!question) {
    return (
      <div className="glass-panel p-8 text-white">
        <progress className="progress progress-primary w-full" />
      </div>
    )
  }
  const contents = question.contents as QuestionContents
  return (
    <div className="glass-panel flex flex-col gap-6 p-8 text-white lg:flex-row">
      {contents.thumbnailUrl ? (
        <figure className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10">
          <img src={contents.thumbnailUrl} alt="thumbnail" className="h-full w-full object-cover" />
        </figure>
      ) : null}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Answer</p>
            <h2 className="text-3xl font-bold">解答と結果</h2>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Win</p>
            <p className="text-3xl font-black text-emerald-300">
              {winCount}/{entriesCount}
            </p>
          </div>
        </div>
        {(() => {
          if (contents.type === 'select') {
            return (
              <ul className="space-y-3">
                {contents.questions.map((q) => {
                  const correct = q.id === contents.answerId
                  return (
                    <li
                      key={q.id}
                      className={`rounded-2xl border px-4 py-3 text-lg ${
                        correct
                          ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                          : 'border-white/10 bg-white/5 text-white'
                      }`}
                    >
                      {q.label}
                    </li>
                  )
                })}
              </ul>
            )
          }
          if (contents.type === 'sort') {
            return (
              <ol className="space-y-3">
                {sortBy(contents.questions, 'order').map((q) => (
                  <li
                    key={q.id}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg"
                  >
                    {`${q.order}. ${q.label}`}
                  </li>
                ))}
              </ol>
            )
          }
        })()}
        <progress className="progress progress-primary w-full" value={winCount} max={entriesCount}></progress>
        <div className="flex justify-end gap-3">
          {nextQuestionId ? (
            <button
              className="btn border-0 bg-gradient-to-r from-emerald-400 to-sky-500 text-slate-900"
              onClick={() => {
                handleNextQuestion(nextQuestionId)
              }}
            >
              次の問題へ
            </button>
          ) : (
            <button className="btn border-0 bg-gradient-to-r from-amber-300 to-pink-500 text-slate-900" onClick={handleShowRank}>
              結果発表へ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
