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
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )
  if (!question) {
    return <progress className="progress" />
  }
  const contents = question.contents as QuestionContents
  return (
    <div className="card w-[70vw] flex-row bg-base-100 p-5 shadow-xl">
      {contents.thumbnailUrl ? (
        <figure className="max-w-[30vw]">
          <img src={contents.thumbnailUrl} alt="thumbnail" />
        </figure>
      ) : null}
      <div className="card-body">
        <h2 className="card-title">Q{question.order}.</h2>
        <p className="text-2xl">{question.title}</p>
        <ul
          tabIndex={0}
          className="rounded-box divide-y bg-base-100 p-2 shadow"
        >
          {contents.questions.map((q) => (
            <li key={q.id} className="p-3 text-2xl">
              {q.label}
            </li>
          ))}
        </ul>
        <div className="text-2xl">
          回答数({submitCount}/{entriesCount})
        </div>
        <progress
          className="progress progress-primary w-full"
          value={submitCount}
          max={entriesCount}
        ></progress>
        <div className="card-actions justify-end">
          <button
            className="btn-primary btn"
            onClick={() => {
              handleQuizAnswer(questionId)
            }}
          >
            回答へ
          </button>
        </div>
      </div>
    </div>
  )
}
