import type { FC } from 'react'
import type { SelectTypeQuestion } from '../../../types/question'
import type {
  QuizParticipantAnswerSelect,
} from '../../../types/quizParticipant'

type Props = {
  contents: SelectTypeQuestion
  setAnswer: (answer: QuizParticipantAnswerSelect) => void
  isSubmit: boolean
  answer: QuizParticipantAnswerSelect
}

export const SelectItems: FC<Props> = ({ contents, setAnswer, isSubmit, answer }) => {
  return (
    <ul className="mb-2 w-full rounded-lg border">
      {contents.questions.map((q) => (
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
  )
}
