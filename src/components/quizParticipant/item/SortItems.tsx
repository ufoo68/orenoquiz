import type { FC } from 'react'
import type { SortTypeQuestion } from '../../../types/question'
import type { QuizParticipantAnswerSort } from '../../../types/quizParticipant'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { sortBy } from 'lodash'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

type Props = {
  contents: SortTypeQuestion
  setAnswer: (answer: QuizParticipantAnswerSort) => void
  isSubmit: boolean
  answer: QuizParticipantAnswerSort
}

export const SortItems: FC<Props> = ({ answer, setAnswer, isSubmit }) => {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id && over) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const activeAnswer = answer.answers.find((a) => a.id === active.id)!
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const overAnswer = answer.answers.find((a) => a.id === over.id)!
      const otherAnswers = answer.answers.filter((a) => a.id !== active.id)

      const answers = sortBy(
        [
          ...otherAnswers.map((a) => {
            if (activeAnswer.order > overAnswer.order) {
              return a.order < overAnswer.order || a.order > activeAnswer.order
                ? a
                : { ...a, order: a.order + 1 }
            }
            return a.order > overAnswer.order || a.order < activeAnswer.order
              ? a
              : { ...a, order: a.order - 1 }
          }),
          { ...activeAnswer, order: overAnswer.order },
        ],
        'order'
      )
      setAnswer({
        type: 'sort',
        answers,
      })
    }
  }
  return (
    <div
      className={`${
        isSubmit ? 'pointer-events-none opacity-60' : ''
      } rounded-2xl border border-white/10 bg-white/5 p-1`}
    >
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={answer.answers}
          strategy={verticalListSortingStrategy}
        >
          {answer.answers.map((q) => (
            <SortableItem key={q.id} id={q.id} label={q.label} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

type ItemProps = {
  id: number
  label: string
}

const SortableItem: FC<ItemProps> = ({ id, label }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      className="mb-2 flex touch-none items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-3 text-white"
      style={style}
      {...attributes}
      {...listeners}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="rgba(248,250,252,0.7)"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
      <div className="text-base">{label}</div>
    </div>
  )
}
