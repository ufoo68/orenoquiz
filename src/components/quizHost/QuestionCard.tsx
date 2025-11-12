'use client'
import type { QuizQuestion } from '@prisma/client'
import type { FC } from 'react'
import { useState } from 'react'
import type { QuestionContents } from '../../types/question'
import { api } from '../../utils/api'

type Props = {
  sessionId: string
  questionId: string
  handleQuizAnswer: (questionId: string) => void
}

export const QuestionCard: FC<Props> = ({
  questionId,
  sessionId,
  handleQuizAnswer,
}) => {
  const [question, setQuestion] = useState<QuizQuestion | null>()
  const [entriesCount, setEntriesCount] = useState<number>(0)
  const [submitCount, setSubmitCount] = useState<number>(0)
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
  api.quizParticipant.getSubmitCount.useQuery(
    { sessionId, questionId },
    {
      onSuccess: (res) => {
        setSubmitCount(res)
      },
      refetchInterval: 1000,
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
    <div className="glass-panel w-full space-y-8 p-10 text-white">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <p className="text-sm uppercase tracking-[0.5em] text-slate-400">
            Now Playing
          </p>
          <h2 className="text-5xl font-black leading-tight">
            Q{question.order}
            <span className="ml-4 text-4xl font-semibold">
              {question.title}
            </span>
          </h2>
          <p className="text-lg text-slate-200">
            回答期限：司会者の「回答へ」ボタンで切り替わります。
          </p>
        </div>
        {contents.thumbnailUrl ? (
          <figure className="h-64 w-full max-w-lg overflow-hidden rounded-[32px] border border-white/20">
            <img
              src={contents.thumbnailUrl}
              alt="thumbnail"
              className="h-full w-full object-cover"
            />
          </figure>
        ) : null}
      </div>
      <ul className="grid gap-4 text-2xl md:grid-cols-2">
        {contents.questions.map((q, index) => (
          <li
            key={q.id}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl font-bold">
              {String.fromCharCode(65 + index)}
            </span>
            <span>{q.label}</span>
          </li>
        ))}
      </ul>
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
          回答状況
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between text-2xl">
          <span className="font-black text-amber-300">
            {submitCount}/{entriesCount}
          </span>
          <span className="text-base text-slate-300">
            未回答 {Math.max(entriesCount - submitCount, 0)} 名
          </span>
        </div>
        <progress
          className="progress progress-primary mt-3 h-4 w-full"
          value={submitCount}
          max={entriesCount}
        ></progress>
      </div>
      <div className="flex justify-end">
        <button
          className="btn border-0 bg-gradient-to-r from-sky-400 to-indigo-500 text-2xl text-white"
          onClick={() => {
            handleQuizAnswer(questionId)
          }}
        >
          回答へ切り替える
        </button>
      </div>
    </div>
  )
}
