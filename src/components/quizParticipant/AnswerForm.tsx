import type { QuizQuestion } from '@prisma/client'
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
  api.quizQuestion.get.useQuery(
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
    await submitAnswer.mutateAsync({
      sessionId,
      questionId,
      participantId,
      answer,
    })
    await getIsSubmit.refetch()
  }
  if (!question) {
    return <progress className="progress" />
  }
  const contents = question.contents as QuestionContents
  return (
    <div className="w-96">
      <div className="card rounded-box m-5 flex items-center bg-white text-2xl">
        {name}
      </div>
      <form className="mx-5 rounded bg-white p-8 shadow-md">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          問題
        </label>
        <p className="mb-2">{question.title}</p>
        <label className="mb-2 block text-sm font-bold text-gray-700">
          回答
        </label>
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
        <div className="flex justify-end space-x-5">
          <button
            className="btn-primary btn"
            type="button"
            disabled={isSubmit}
            onClick={handleSubmitAnswer}
          >
            回答する
          </button>
        </div>
      </form>
    </div>
  )
}
