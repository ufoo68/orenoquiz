import type { QuizMaster } from '@prisma/client'
import { type NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '../../utils/api'
import { useRouter } from 'next/navigation'
import { sortBy } from 'lodash'

const Quiz: NextPage = () => {
  const [quizzes, setQuizzes] = useState<(QuizMaster & { editing: boolean })[]>(
    []
  )
  const { data: session } = useSession()
  const router = useRouter()

  const createQuiz = api.quizMaster.create.useMutation()
  const updateQuizTitle = api.quizMaster.updateTitle.useMutation()
  const getAllQuiz = api.quizMaster.getAll.useQuery(undefined, {
    onSuccess: (res) => {
      setQuizzes(
        sortBy(
          res.map((q) => ({ ...q, editing: false })),
          'createdAt'
        )
      )
    },
  })
  const deleteQuiz = api.quizMaster.delete.useMutation()

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
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      ...quizzes.find((q) => q.id === masterId)!,
      title,
      editing: true,
    }
    const otherQuizzes = quizzes.filter((q) => q.id !== masterId)
    setQuizzes(sortBy([...otherQuizzes, newQuiz], 'createdAt'))
  }

  const handleSaveQuizTitle = async (masterId: string, title: string) => {
    await updateQuizTitle.mutateAsync({ masterId, title })
    await getAllQuiz.refetch()
  }

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [])

  if (getAllQuiz.isLoading) {
    return <progress className="progress" />
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-5 bg-neutral-200">
      <button
        className="btn absolute top-10 right-10"
        onClick={() => router.push('/')}
      >
        トップ画面
      </button>
      {quizzes.map((q) => (
        <div key={q.id} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex justify-between">
              <input
                className="input-bordered input w-full"
                value={q.title}
                type="text"
                onChange={(e) => {
                  const title = e.target.value
                  handleUpdateQuizTitle(q.id, title)
                }}
              />
              <button
                className="btn-primary btn"
                type="button"
                onClick={() => handleSaveQuizTitle(q.id, q.title)}
                disabled={!q.editing}
              >
                保存
              </button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8 cursor-pointer"
                onClick={() => {
                  handleDeleteQuiz(q.id).catch((e) => console.error(e))
                }}
              >
                <path
                  fillRule="evenodd"
                  d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                  clipRule="evenodd"
                />
              </svg>
            </h2>
            <div className="card-actions justify-end">
              <Link href={`/quiz/question/${q.id}`} legacyBehavior passHref>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-primary  link"
                >
                  <button className="btn-primary btn">設定画面</button>
                </a>
              </Link>
              <Link href={`/quiz/session/${q.id}`} legacyBehavior passHref>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-primary  link"
                >
                  <button className="btn-primary btn">ゲーム画面</button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      ))}
      <button
        className="btn-secondary btn"
        onClick={() => {
          handleCreateQuiz().catch((e) => {
            console.error(e)
          })
        }}
      >
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
  )
}

export default Quiz
