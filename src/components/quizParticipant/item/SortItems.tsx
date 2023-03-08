import type { FC } from 'react'
import type { SortTypeQuestion } from '../../../types/question'
import type { QuizParticipantAnswerSort } from '../../../types/quizParticipant'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { DragEndEvent } from '@dnd-kit/core'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
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
        isSubmit ? 'pointer-events-none' : ''
      } mb-2 w-full rounded-lg border`}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
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
      className="border p-3 flex space-x-2"
      style={style}
      {...attributes}
      {...listeners}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="gray"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
      <div>{label}</div>
    </div>
  )
}
