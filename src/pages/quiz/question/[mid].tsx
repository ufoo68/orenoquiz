import type { QuizQuestion } from '@prisma/client'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { type NextPage } from 'next'
import { useState } from 'react'
import { QuestionForm } from '../../../components/quizQuestion/QuestionForm'
import { api } from '../../../utils/api'
import { QuestionMenu } from '../../../components/quizQuestion/QuestionMenu'
import { sortBy } from 'lodash'
import type { QuestionContents } from '../../../types/question'

type Props = {
  masterId: string
}

const Question: NextPage<Props> = ({ masterId }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [selectedQuestion, setSelectedQestion] = useState<QuizQuestion>()
  const getAllQuestion = api.quizQuestion.getAll.useQuery(
    { masterId },
    {
      onSuccess: (res) => {
        setQuestions(res)
      },
    }
  )
  const updateQuestion = api.quizQuestion.update.useMutation()
  const createQuestion = api.quizQuestion.create.useMutation()
  const deleteQuestion = api.quizQuestion.delete.useMutation()
  const changeQuestionOrder = api.quizQuestion.changeOrder.useMutation()
  const handleChangeSelectedQuestion = (params: Partial<QuizQuestion>) => {
    setSelectedQestion({
      ...selectedQuestion,
      ...params,
    } as QuizQuestion)
  }
  const handleSaveSelectedQuestion = async () => {
    const { id, title, order } = selectedQuestion as QuizQuestion
    const contents = selectedQuestion?.contents as QuestionContents
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
    await deleteQuestion.mutateAsync({
      questionId: selectedQuestion?.id ?? '',
    })
    await getAllQuestion.refetch()
  }
  const handleChangeOrder = async (
    active: QuizQuestion,
    over: QuizQuestion
  ) => {
    await changeQuestionOrder.mutateAsync({
      id: active.id,
      order: over.order,
    })
    await changeQuestionOrder.mutateAsync({
      id: over.id,
      order: active.order,
    })
    await getAllQuestion.refetch()
  }

  if (getAllQuestion.isLoading) {
    return <progress className="progress" />
  }
  return (
    <div className="grid h-screen w-screen grid-flow-col grid-cols-3 bg-neutral-200">
      <div className="flex h-screen flex-col items-center justify-center space-y-5">
        <QuestionMenu
          questions={questions}
          handleSelectQuestion={(question) => setSelectedQestion(question)}
          handleChangeOrder={handleChangeOrder}
        />
        <button className="btn" onClick={handleCreateQuestion}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="col-span-2 flex h-screen items-center justify-center">
        <QuestionForm
          question={selectedQuestion}
          handleChangeSelectedQuestion={handleChangeSelectedQuestion}
          handleSaveSelectedQuestion={handleSaveSelectedQuestion}
          handleDeleteQuestion={handleDeleteQuestion}
        />
      </div>
    </div>
  )
}

export const getServerSideProps = (
  context: GetServerSidePropsContext
): GetServerSidePropsResult<Props> => {
  const { mid } = context.query
  if (typeof mid !== 'string') {
    return { notFound: true }
  }
  return { props: { masterId: mid } }
}

export default Question
