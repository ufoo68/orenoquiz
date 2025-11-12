'use client'

import type { QuizQuestion } from '@prisma/client'
import { sortBy } from 'lodash'
import { useMemo, useState } from 'react'

import { NeonBackground } from '../../../../components/common/NeonBackground'
import { QuestionForm } from '../../../../components/quizQuestion/QuestionForm'
import { QuestionMenu } from '../../../../components/quizQuestion/QuestionMenu'
import type { QuestionContents } from '../../../../types/question'
import { api } from '../../../../utils/api'

type PageProps = {
  params: {
    mid: string
  }
}

const QuizQuestionPage = ({ params }: PageProps) => {
  const { mid: masterId } = params
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion>()

  const getAllQuestion = api.quizQuestion.getAll.useQuery(
    { masterId },
    {
      onSuccess: (res) => {
        setQuestions(res)
        if (!selectedQuestion && res.length > 0) {
          setSelectedQuestion(res[0])
        }
      },
    }
  )
  const updateQuestion = api.quizQuestion.update.useMutation()
  const createQuestion = api.quizQuestion.create.useMutation()
  const deleteQuestion = api.quizQuestion.delete.useMutation()
  const changeQuestionOrder = api.quizQuestion.changeOrder.useMutation()

  const handleChangeSelectedQuestion = (params: Partial<QuizQuestion>) => {
    setSelectedQuestion({
      ...selectedQuestion,
      ...params,
    } as QuizQuestion)
  }

  const handleSaveSelectedQuestion = async () => {
    if (!selectedQuestion) return
    const { id, title, order } = selectedQuestion
    const contents = selectedQuestion.contents as QuestionContents
    await updateQuestion.mutateAsync({
      id,
      title,
      order,
      contents: {
        ...contents,
        questions: sortBy(contents.questions, 'id'),
      },
    })
    await getAllQuestion.refetch()
  }

  const handleCreateQuestion = async () => {
    await createQuestion.mutateAsync({ masterId, order: questions.length + 1 })
    await getAllQuestion.refetch()
  }

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return
    await deleteQuestion.mutateAsync({
      questionId: selectedQuestion.id,
    })
    await getAllQuestion.refetch()
    setSelectedQuestion(undefined)
  }

  const handleChangeOrder = async (active: QuizQuestion, over: QuizQuestion) => {
    await changeQuestionOrder.mutateAsync({ id: active.id, order: over.order })
    await changeQuestionOrder.mutateAsync({ id: over.id, order: active.order })
    await getAllQuestion.refetch()
  }

  const loading = getAllQuestion.isLoading

  const questionCount = useMemo(() => questions.length, [questions.length])

  return (
    <NeonBackground>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <progress className="progress progress-primary w-64" />
        </div>
      ) : (
        <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-8 px-5 py-10 text-white lg:grid-cols-[320px_1fr]">
          <aside className="flex flex-col gap-6">
            <div className="glass-panel space-y-2 px-6 py-5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Questions</p>
              <p className="text-3xl font-bold">{questionCount}</p>
              <button
                className="btn mt-4 w-full border-0 bg-gradient-to-r from-emerald-400 to-sky-500 text-slate-900"
                onClick={() => {
                  handleCreateQuestion().catch((error) => console.error(error))
                }}
              >
                問題を追加
              </button>
            </div>
            <QuestionMenu
              questions={questions}
              handleSelectQuestion={(question) => setSelectedQuestion(question)}
              handleChangeOrder={handleChangeOrder}
              selectedId={selectedQuestion?.id}
            />
          </aside>
          <section className="glass-panel flex flex-col overflow-hidden p-6">
            <QuestionForm
              question={selectedQuestion}
              handleChangeSelectedQuestion={handleChangeSelectedQuestion}
              handleSaveSelectedQuestion={handleSaveSelectedQuestion}
              handleDeleteQuestion={handleDeleteQuestion}
            />
          </section>
        </div>
      )}
    </NeonBackground>
  )
}

export default QuizQuestionPage
