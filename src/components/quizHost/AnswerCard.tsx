import type { QuizQuestion } from '@prisma/client'
import type { FC } from 'react'
import { useState } from 'react'
import type { QuestionContents } from '../../types/question'
import { api } from '../../utils/api'

type Props = {
  sessionId: string
  questionId: string
  handleNextQuestion: (questionId: string) => void
}

export const AnswerCard: FC<Props> = ({
  questionId,
  sessionId,
  handleNextQuestion,
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
    return <progress className="progress" />
  }
  const contents = question.contents as QuestionContents
  if (contents.type === 'select') {
    return (
      <div className="card w-96 bg-base-100 shadow-xl">
        {contents.thumbnailUrl ? (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={contents.thumbnailUrl} alt="Shoes" />
          </figure>
        ) : null}
        <div className="card-body">
          <h2 className="card-title">
            A.{' '}
            {contents.questions.find((q) => q.id === contents.answerId)?.label}
          </h2>
          <div>
            正解数({winCount}/{entriesCount})
          </div>
          <progress
            className="progress progress-primary w-full"
            value={winCount}
            max={entriesCount}
          ></progress>
          <div className="card-actions justify-end">
            {nextQuestionId ? (
              <button
                className="btn-primary btn"
                onClick={() => {
                  handleNextQuestion(nextQuestionId)
                }}
              >
                次の問題へ
              </button>
            ) : (
              <button className="btn-primary btn">結果発表へ</button>
            )}
          </div>
        </div>
      </div>
    )
  }
  return null
}
