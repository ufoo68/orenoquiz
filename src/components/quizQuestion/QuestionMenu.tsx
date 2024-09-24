import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { QuizQuestion } from '@prisma/client'
import type { FC } from 'react'
import { CSS } from '@dnd-kit/utilities'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

type Props = {
  questions: QuizQuestion[]
  handleSelectQuestion: (question: QuizQuestion) => void
  handleChangeOrder: (active: QuizQuestion, over: QuizQuestion) => void
}

type ItemProps = {
  id: string
  question: QuizQuestion
  handleSelectQuestion: (question: QuizQuestion) => void
}

export const QuestionMenu: FC<Props> = ({
  questions,
  handleSelectQuestion,
  handleChangeOrder,
}) => {
  const sensors = useSensors(useSensor(PointerSensor))
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id && over) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const activeQuestion = questions.find((a) => a.id === active.id)!
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const orverQuestion = questions.find((a) => a.id === over.id)!
      handleChangeOrder(activeQuestion, orverQuestion)
    }
  }
  return (
    <ul className="menu rounded-box w-11/12 bg-base-100 p-2">
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={questions}
          strategy={verticalListSortingStrategy}
        >
          {questions.map((question) => (
            <SortableItem
              key={question.id}
              id={question.id}
              question={question}
              handleSelectQuestion={handleSelectQuestion}
            />
          ))}
        </SortableContext>
      </DndContext>
    </ul>
  )
}

const SortableItem: FC<ItemProps> = ({
  id,
  question,
  handleSelectQuestion,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li style={style} ref={setNodeRef}>
      <a onClick={() => handleSelectQuestion(question)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="gray"
          className="h-6 w-6 cursor-grab touch-none"
          {...attributes}
          {...listeners}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
        {question.title}
      </a>
    </li>
  )
}
