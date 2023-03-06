import type { QuizQuestion } from '@prisma/client'
import type { FC } from 'react'
import { useState } from 'react'
import type { QuestionContents } from '../../types/question'
import type { QuizParticipantAnswer } from '../../types/quizParticipant'
import { api } from '../../utils/api'
import { sortBy } from 'lodash'

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
        if (contents.type === 'select') {
          setAnswer({
            type: 'select',
            answerId: Math.min(...contents.questions.map((q) => q.id)),
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
  if (contents.type === 'select' && answer?.type === 'select') {
    return (
      <div className="w-full">
        <div className="card rounded-box m-5 flex items-center bg-white text-2xl">
          {name}
        </div>
        <form className="mx-5 rounded bg-white p-8 shadow-md">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            問題
          </label>
          <p className="mb-2">
            {question.title}
          </p>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            回答
          </label>
          <ul className="mb-2 w-full rounded-lg border">
            {sortBy(contents.questions, 'id').map((q) => (
              <li
                key={q.id}
                className="w-full cursor-pointer rounded-t-lg border-b border-gray-200"
                onClick={() => {
                  if (!isSubmit) {
                    setAnswer({
                      type: 'select',
                      answerId: q.id,
                    })
                  }
                }}
              >
                <div className="flex items-center p-3">
                  <input
                    type="radio"
                    name="radio-1"
                    className="radio"
                    checked={q.id === answer.answerId}
                    disabled={isSubmit}
                    readOnly
                  />
                  <label className="ml-2 w-full py-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {q.label}
                  </label>
                </div>
              </li>
            ))}
          </ul>
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
  return null
}
