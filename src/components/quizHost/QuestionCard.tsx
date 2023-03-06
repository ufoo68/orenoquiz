import type { QuizQuestion } from '@prisma/client'
import type { FC } from 'react'
import { useState } from 'react'
import type { QuestionContents } from '../../types/question'
import { api } from '../../utils/api'

type Props = {
  sessionId: string
  questionId: string
}

export const QuestionCard: FC<Props> = ({ questionId, sessionId }) => {
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
    }
  )
  if (!question) {
    return <progress className="progress" />
  }
  const contents = question.contents as QuestionContents
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={contents.thumbnailUrl} alt="Shoes" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">Q{question.order}.</h2>
        <p>{question.title}</p>
        <div>
          回答数({submitCount}/{entriesCount})
        </div>
        <progress
          className="progress progress-primary w-full"
          value={submitCount}
          max={entriesCount}
        ></progress>
        <div className="card-actions justify-end">
          <button className="btn-primary btn">回答へ</button>
        </div>
      </div>
    </div>
  )
}
