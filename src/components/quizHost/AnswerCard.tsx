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
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      {contents.thumbnailUrl ? (
        <figure className="h-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={contents.thumbnailUrl} alt="Shoes" />
        </figure>
      ) : null}
      <div className="card-body">
        <h2 className="card-title">答え.</h2>
        {(() => {
          if (contents.type === 'select') {
            return (
              <ul className="menu rounded-box border bg-base-100 p-2">
                {contents.questions.map((q) => (
                  <li key={q.id}>
                    <div>
                      {q.id === contents.answerId ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="green"
                          className="h-6 w-6"
                        >
                          <path
                            fillRule="evenodd"
                            d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="red"
                          className="h-6 w-6 cursor-pointer"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {q.label}
                    </div>
                  </li>
                ))}
              </ul>
            )
          } else if (contents.type === 'sort') {
            return (
              <ul
                tabIndex={0}
                className="rounded-box divide-y bg-base-100 p-2 shadow"
              >
                {sortBy(contents.questions, 'order').map((q) => (
                  <li key={q.id} className="p-3">
                    {`${q.order}. ${q.label}`}
                  </li>
                ))}
              </ul>
            )
          }
        })()}
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
