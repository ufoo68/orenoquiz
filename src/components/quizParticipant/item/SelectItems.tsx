import type { FC } from 'react'
import type { SelectTypeQuestion } from '../../../types/question'
import type { QuizParticipantAnswerSelect } from '../../../types/quizParticipant'

type Props = {
  contents: SelectTypeQuestion
  setAnswer: (answer: QuizParticipantAnswerSelect) => void
  isSubmit: boolean
  answer: QuizParticipantAnswerSelect
}

export const SelectItems: FC<Props> = ({
  contents,
  setAnswer,
  isSubmit,
  answer,
}) => {
  return (
    <ul className="space-y-3">
      {contents.questions.map((q) => {
        const active = q.id === answer.answerId
        return (
          <li key={q.id}>
            <button
              type="button"
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left text-white transition ${
                active
                  ? 'border-amber-400/70 bg-amber-400/10 shadow-lg shadow-amber-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/30'
              } ${isSubmit ? 'opacity-60' : ''}`}
              onClick={() => {
                if (!isSubmit) {
                  setAnswer({
                    type: 'select',
                    answerId: q.id,
                  })
                }
              }}
              disabled={isSubmit}
            >
              <span>{q.label}</span>
              <span
                className={`h-4 w-4 rounded-full border ${
                  active ? 'border-amber-300 bg-amber-400' : 'border-white/40'
                }`}
              />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
