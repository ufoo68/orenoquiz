import type { FC } from 'react'
import { sortBy } from 'lodash'
import type { QuestionContents } from '../../types/question'

type Props = {
  contents: QuestionContents
  handleSave: (constents: QuestionContents) => void
}

export const QuestionFormContents: FC<Props> = ({ contents, handleSave }) => {
  if (contents.type === 'select') {
    return (
      <div className="flex flex-col space-y-5">
        <ul className="menu rounded-box border bg-base-100 p-2">
          {sortBy(contents.questions, 'id').map((question) => (
            <li key={question.id}>
              <div className="cursor-default">
                <input
                  className="input-bordered input w-full"
                  value={question.label}
                  onChange={(e) => {
                    const otherQuestions = contents.questions.filter(
                      (q) => q.id !== question.id
                    )
                    handleSave({
                      ...contents,
                      questions: [
                        ...otherQuestions,
                        {
                          ...question,
                          label: e.target.value,
                        },
                      ],
                    })
                  }}
                />
                {question.id === contents.answerId ? (
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
                    onClick={() => {
                      handleSave({
                        ...contents,
                        answerId: question.id,
                      })
                    }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => {
                    handleSave({
                      ...contents,
                      questions: contents.questions.filter(
                        (q) => q.id !== question.id
                      ),
                    })
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M2.515 10.674a1.875 1.875 0 000 2.652L8.89 19.7c.352.351.829.549 1.326.549H19.5a3 3 0 003-3V6.75a3 3 0 00-3-3h-9.284c-.497 0-.974.198-1.326.55l-6.375 6.374zM12.53 9.22a.75.75 0 10-1.06 1.06L13.19 12l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L15.31 12l1.72-1.72a.75.75 0 10-1.06-1.06l-1.72 1.72-1.72-1.72z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </li>
          ))}
        </ul>
        {contents.questions.length < 4 ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6 cursor-pointer"
            onClick={() => {
              handleSave({
                ...contents,
                questions: [
                  ...contents.questions,
                  {
                    id: Math.max(...contents.questions.map((q) => q.id)) + 1,
                    label: '選択肢',
                  },
                ],
              })
            }}
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        ) : null}
      </div>
    )
  } else if (contents.type === 'sort') {
    return (
      <div className="flex flex-col space-y-5">
        <ul className="menu rounded-box border bg-base-100 p-2">
          {sortBy(contents.questions, 'id').map((question) => (
            <li key={question.id}>
              <div className="cursor-default">
                <input
                  className="input-bordered input w-full"
                  value={question.label}
                  onChange={(e) => {
                    const otherQuestions = contents.questions.filter(
                      (q) => q.id !== question.id
                    )
                    handleSave({
                      ...contents,
                      questions: [
                        ...otherQuestions,
                        {
                          ...question,
                          label: e.target.value,
                        },
                      ],
                    })
                  }}
                />
                <select
                  className="select-bordered select"
                  value={question.order}
                  onChange={(e) => {
                    const previousOrder = question.order
                    const currentOrder = Number(e.target.value)
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const replaceQuestion = contents.questions.find(
                      (q) => q.order === currentOrder
                    )!
                    const otherQuestions = contents.questions.filter(
                      (q) =>
                        q.order !== previousOrder && q.order !== currentOrder
                    )
                    handleSave({
                      ...contents,
                      questions: [
                        ...otherQuestions,
                        {
                          ...question,
                          order: currentOrder,
                        },
                        { 
                          ...replaceQuestion,
                          order: previousOrder,
                        }
                      ],
                    })
                  }}
                >
                  {[...Array(contents.questions.length).keys()].map((order) => (
                    <option key={order} value={order + 1}>
                      {order + 1}番
                    </option>
                  ))}
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => {
                    handleSave({
                      ...contents,
                      questions: contents.questions.filter(
                        (q) => q.id !== question.id
                      ),
                    })
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M2.515 10.674a1.875 1.875 0 000 2.652L8.89 19.7c.352.351.829.549 1.326.549H19.5a3 3 0 003-3V6.75a3 3 0 00-3-3h-9.284c-.497 0-.974.198-1.326.55l-6.375 6.374zM12.53 9.22a.75.75 0 10-1.06 1.06L13.19 12l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L15.31 12l1.72-1.72a.75.75 0 10-1.06-1.06l-1.72 1.72-1.72-1.72z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </li>
          ))}
        </ul>
        {contents.questions.length < 4 ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6 cursor-pointer"
            onClick={() => {
              handleSave({
                ...contents,
                questions: [
                  ...contents.questions,
                  {
                    id: Math.max(...contents.questions.map((q) => q.id)) + 1,
                    label: '要素',
                    order:
                      Math.max(...contents.questions.map((q) => q.order)) + 1,
                  },
                ],
              })
            }}
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        ) : null}
      </div>
    )
  }
  return <></>
}
