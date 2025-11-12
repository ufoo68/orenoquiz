'use client'

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
  selectedId?: string
}

type ItemProps = {
  id: string
  question: QuizQuestion
  handleSelectQuestion: (question: QuizQuestion) => void
  active: boolean
}

export const QuestionMenu: FC<Props> = ({
  questions,
  handleSelectQuestion,
  handleChangeOrder,
  selectedId,
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
    <ul className="glass-panel flex-1 space-y-3 overflow-y-auto px-4 py-5">
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
              active={question.id === selectedId}
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
  active,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li style={style} ref={setNodeRef}>
      <button
        type="button"
        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-white ${
          active ? 'border-amber-400/60 bg-amber-400/10' : 'border-white/10 bg-white/5'
        }`}
        onClick={() => handleSelectQuestion(question)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
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
        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-[0.3em] text-slate-300">Q{question.order}</span>
          <span className="text-lg">{question.title || 'タイトル未設定'}</span>
        </div>
      </button>
    </li>
  )
}
