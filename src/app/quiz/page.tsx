'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import type { QuizMaster } from '@prisma/client'

import { NeonBackground } from '../../components/common/NeonBackground'
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
    const base = quizzes.find((q) => q.id === masterId)
    if (!base) return
    const newQuiz = {
      ...base,
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

  const loading = status === 'loading' || getAllQuiz.isLoading

  const stats = useMemo(
    () => [
      { label: '登録クイズ数', value: quizzes.length },
      { label: '最終更新', value: quizzes.length ? '最新順に表示中' : '---' },
    ],
    [quizzes.length]
  )

  return (
    <NeonBackground>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <progress className="progress progress-primary w-64" />
        </div>
      ) : (
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-5 py-10 text-white">
          <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-300">Quiz Control</p>
              <h1 className="mt-2 text-4xl font-black">クイズ管理ダッシュボード</h1>
              <p className="text-sm text-slate-200">ゲームの作成・編集・セッション管理をここから実施します。</p>
            </div>
            <button className="btn border-white/20 bg-white/5 text-white" onClick={() => router.push('/')}>トップへ戻る</button>
          </header>

          <section className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-panel space-y-2 px-6 py-5">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">クイズ一覧</h2>
              <button
                className="btn border-0 bg-gradient-to-r from-amber-400 to-pink-500 text-slate-900"
                onClick={() => {
                  handleCreateQuiz().catch((error) => console.error(error))
                }}
              >
                新しいクイズを作成
              </button>
            </div>
            {quizzes.length === 0 ? (
              <div className="glass-panel p-10 text-center text-slate-200">
                まだクイズがありません。上の「新しいクイズを作成」から登録してください。
              </div>
            ) : (
              <div className="space-y-5">
                {quizzes
                  .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                  .map((quiz) => (
                    <article key={quiz.id} className="glass-panel space-y-6 p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <input
                          className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-lg text-white focus:border-amber-300 focus:outline-none"
                          value={quiz.title}
                          type="text"
                          onChange={(event) => {
                            handleUpdateQuizTitle(quiz.id, event.target.value)
                          }}
                        />
                        <div className="flex gap-3">
                          <button
                            className="btn border-0 bg-emerald-400/80 text-slate-900"
                            type="button"
                            onClick={() => {
                              handleSaveQuizTitle(quiz.id, quiz.title).catch((error) => console.error(error))
                            }}
                            disabled={!quiz.editing}
                          >
                            保存
                          </button>
                          <button
                            className="btn border-0 bg-rose-500/80 text-white"
                            type="button"
                            onClick={() => {
                              handleDeleteQuiz(quiz.id).catch((error) => console.error(error))
                            }}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                        <span>作成日：{quiz.createdAt.toLocaleString()}</span>
                        <div className="flex flex-wrap gap-3">
                          <Link href={`/quiz/question/${quiz.id}`} target="_blank" className="btn border-white/20 bg-white/5 text-white">
                            設定画面
                          </Link>
                          <Link href={`/quiz/session/${quiz.id}`} target="_blank" className="btn border-white/20 bg-white/5 text-white">
                            セッション一覧
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </section>
        </div>
      )}
    </NeonBackground>
  )
}

export default QuizDashboardPage
