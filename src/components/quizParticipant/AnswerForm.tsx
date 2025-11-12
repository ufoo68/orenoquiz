import type { QuizQuestion } from '@prisma/client'
'use client'

import type { FC } from 'react'
import { useState } from 'react'
import type { QuestionContents } from '../../types/question'
import type { QuizParticipantAnswer } from '../../types/quizParticipant'
import { api } from '../../utils/api'
import { SelectItems } from './item/SelectItems'
import { SortItems } from './item/SortItems'

type Props = {
  sessionId: string
  participantId: string
  questionId: string
}

export const AnswerForm: FC<Props> = ({
  questionId,
  participantId,
  sessionId,
}) => {
  const [question, setQuestion] = useState<QuizQuestion | null>()
  const [answer, setAnswer] = useState<QuizParticipantAnswer>()
  const [name, setName] = useState<string>('')
  const [isSubmit, setIsSubmit] = useState<boolean>(false)
  api.quizQuestion.getWithoutAnswer.useQuery(
    { questionId },
    {
      onSuccess: (res) => {
        setQuestion(res)
        const contents = res?.contents as QuestionContents
        if (contents.type === 'select' && !answer) {
          setAnswer({
            type: 'select',
            answerId: Math.min(...contents.questions.map((q) => q.id)),
          })
        } else if (contents.type === 'sort' && !answer) {
          setAnswer({
            type: 'sort',
            answers: contents.questions.map((q, i) => ({
              id: q.id,
              label: q.label,
              order: i + 1,
            })),
          })
        }
      },
    }
  )
  api.quizParticipant.getName.useQuery(
    { participantId },
    {
      onSuccess: (res) => {
        setName(res)
      },
    }
  )
  const getIsSubmit = api.quizParticipant.getIsSubmited.useQuery(
    {
      questionId,
      sessionId,
      participantId,
    },
    {
      onSuccess: (res) => {
        setIsSubmit(res)
      },
    }
  )
  const submitAnswer = api.quizParticipant.submitAnswer.useMutation()
  const handleSubmitAnswer = async () => {
    const isOk = window.confirm('この回答で送信しますか？')
    if (!isOk) return
    await submitAnswer.mutateAsync({
      sessionId,
      questionId,
      participantId,
      answer,
    })
    await getIsSubmit.refetch()
    window.alert('回答を送信しました。')
  }
  if (!question) {
    return (
      <div className="glass-panel w-full max-w-lg p-10 text-white">
        <progress className="progress progress-primary w-full" />
      </div>
    )
  }
  const contents = question.contents as QuestionContents
  return (
    <div className="w-full max-w-lg space-y-4">
      <form className="glass-panel space-y-6 p-8 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Question</p>
          <p className="mt-2 text-xl font-semibold text-white">{question.title}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Answer</p>
          <div className="mt-3">
            {(() => {
              if (contents.type === 'select' && answer?.type === 'select') {
                return (
                  <SelectItems
                    answer={answer}
                    contents={contents}
                    setAnswer={setAnswer}
                    isSubmit={isSubmit}
                  />
                )
              } else if (contents.type === 'sort' && answer?.type === 'sort') {
                return (
                  <SortItems
                    answer={answer}
                    contents={contents}
                    setAnswer={setAnswer}
                    isSubmit={isSubmit}
                  />
                )
              }
            })()}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="btn border-0 bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30"
            type="button"
            disabled={isSubmit}
            onClick={handleSubmitAnswer}
          >
            回答を送信
          </button>
        </div>
      </form>
    </div>
  )
}
