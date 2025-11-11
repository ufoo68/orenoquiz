'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import type { QuizMaster } from '@prisma/client'

import { api } from '../../utils/api'

const QuizDashboardPage = () => {
  const [quizzes, setQuizzes] = useState<(QuizMaster & { editing: boolean })[]>([])
  const { status } = useSession()
  const router = useRouter()

  const createQuiz = api.quizMaster.create.useMutation()
  const updateQuizTitle = api.quizMaster.updateTitle.useMutation()
  const getAllQuiz = api.quizMaster.getAll.useQuery(undefined, {
    enabled: status === 'authenticated',
    onSuccess: (res) => {
      setQuizzes(
        res
          .map((quiz) => ({ ...quiz, editing: false }))
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      )
    },
  })
  const deleteQuiz = api.quizMaster.delete.useMutation()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/')
    }
  }, [router, status])

  const handleCreateQuiz = async () => {
    await createQuiz.mutateAsync()
    await getAllQuiz.refetch()
  }

  const handleDeleteQuiz = async (masterId: string) => {
    await deleteQuiz.mutateAsync({ masterId })
    await getAllQuiz.refetch()
  }

  const handleUpdateQuizTitle = (masterId: string, title: string) => {
    const newQuiz = {
      // biome-ignore lint/style/noNonNullAssertion: existing quiz is required
      ...quizzes.find((q) => q.id === masterId)!,
      title,
      editing: true,
    }
    const otherQuizzes = quizzes.filter((q) => q.id !== masterId)
    setQuizzes([...otherQuizzes, newQuiz].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()))
  }

  const handleSaveQuizTitle = async (masterId: string, title: string) => {
    await updateQuizTitle.mutateAsync({ masterId, title })
    await getAllQuiz.refetch()
  }

  if (status === 'loading' || getAllQuiz.isLoading) {
    return <progress className="progress" />
  }

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center space-y-5 bg-neutral-200 p-4">
      <button className="btn absolute top-10 right-10" onClick={() => router.push('/')}>
        トップ画面
      </button>
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="card w-full max-w-3xl bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex flex-col gap-3 lg:flex-row">
              <input
                className="input-bordered input w-full"
                value={quiz.title}
                type="text"
                onChange={(event) => {
                  handleUpdateQuizTitle(quiz.id, event.target.value)
                }}
              />
              <div className="flex gap-3">
                <button
                  className="btn-primary btn"
                  type="button"
                  onClick={() => {
                    handleSaveQuizTitle(quiz.id, quiz.title).catch((error) => console.error(error))
                  }}
                  disabled={!quiz.editing}
                >
                  保存
                </button>
                <button
                  className="btn-error btn"
                  type="button"
                  onClick={() => {
                    handleDeleteQuiz(quiz.id).catch((error) => console.error(error))
                  }}
                >
                  削除
                </button>
              </div>
            </h2>
            <div className="card-actions justify-end gap-3">
              <Link
                href={`/quiz/question/${quiz.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn"
              >
                設定画面
              </Link>
              <Link
                href={`/quiz/session/${quiz.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn"
              >
                ゲーム画面
              </Link>
            </div>
          </div>
        </div>
      ))}
      <button
        className="btn-secondary btn"
        onClick={() => {
          handleCreateQuiz().catch((error) => console.error(error))
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path
            fillRule="evenodd"
            d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}

export default QuizDashboardPage
