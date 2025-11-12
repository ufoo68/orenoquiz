'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { QuizSession } from '@prisma/client'

import { NeonBackground } from '../../../../components/common/NeonBackground'
import { QuizSessionState } from '../../../../types/quizSession'
import { api } from '../../../../utils/api'

type PageProps = {
  params: {
    mid: string
  }
}

const stateDict: Record<QuizSessionState['type'], { label: string; color: string }> = {
  entry: { label: '受付中', color: 'bg-sky-400/20 text-sky-200' },
  question: { label: 'プレイ中', color: 'bg-amber-400/20 text-amber-200' },
  answer: { label: '回答中', color: 'bg-emerald-400/20 text-emerald-200' },
  rank: { label: '結果発表', color: 'bg-indigo-400/20 text-indigo-200' },
  end: { label: '終了', color: 'bg-slate-500/30 text-slate-200' },
}

const QuizSessionPage = ({ params }: PageProps) => {
  const { mid: masterId } = params
  const [sessions, setSessions] = useState<QuizSession[]>([])

  const createSession = api.quizSession.create.useMutation()
  const getAllSession = api.quizSession.getAll.useQuery(
    { masterId },
    {
      onSuccess: (res) => {
        setSessions(res)
      },
    }
  )
  const deleteSession = api.quizSession.delete.useMutation()
  const resetSession = api.quizSession.updateStateReset.useMutation()

  const handleCreateSession = async () => {
    await createSession.mutateAsync({ masterId })
    await getAllSession.refetch()
  }

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession.mutateAsync({ sessionId })
    await getAllSession.refetch()
  }

  const handleResetSession = async (sessionId: string) => {
    await resetSession.mutateAsync({ sessionId })
    await getAllSession.refetch()
  }

  const loading = getAllSession.isLoading

  const stats = useMemo(
    () => [
      { label: '総セッション', value: sessions.length },
      { label: '進行中', value: sessions.filter((s) => (s.state as QuizSessionState).type !== 'end').length },
    ],
    [sessions]
  )

  return (
    <NeonBackground>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <progress className="progress progress-primary w-64" />
        </div>
      ) : (
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-5 py-10 text-white">
          <header className="flex flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-300">Session Control</p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-black">セッション管理</h1>
                <p className="text-sm text-slate-200">URL共有やリセット、司会／参加者ビューへ素早くアクセスできます。</p>
              </div>
              <button
                className="btn border-0 bg-gradient-to-r from-emerald-400 to-sky-500 text-slate-900"
                onClick={() => {
                  handleCreateSession().catch((error) => console.error(error))
                }}
              >
                新規セッションを発行
              </button>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-panel space-y-2 px-6 py-5">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="space-y-5">
            {sessions.length === 0 ? (
              <div className="glass-panel p-10 text-center text-slate-200">まだセッションがありません。新規発行してください。</div>
            ) : (
              sessions.map((session) => {
                const state = session.state as QuizSessionState
                const badge = stateDict[state.type]
                return (
                  <article key={session.id} className="glass-panel space-y-6 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Session ID</p>
                        <h2 className="text-2xl font-bold">{session.id}</h2>
                      </div>
                      <span className={`rounded-full px-4 py-1 text-sm ${badge.color}`}>{badge.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <Link
                        href={`/quiz/participant/${session.id}`}
                        target="_blank"
                        className="btn border-white/20 bg-white/5 text-white"
                      >
                        参加者画面
                      </Link>
                      <Link
                        href={`/quiz/host/${session.id}`}
                        target="_blank"
                        className="btn border-white/20 bg-white/5 text-white"
                      >
                        司会画面
                      </Link>
                      <Link
                        href={`/quiz/board/${session.id}`}
                        target="_blank"
                        className="btn border-white/20 bg-white/5 text-white"
                      >
                        会場ディスプレイ
                      </Link>
                      <button className="btn border-white/20 bg-white/5 text-white" onClick={() => handleResetSession(session.id).catch((error) => console.error(error))}>
                        リセット
                      </button>
                      <button className="btn border-0 bg-rose-500/80 text-white" onClick={() => handleDeleteSession(session.id).catch((error) => console.error(error))}>
                        削除
                      </button>
                    </div>
                  </article>
                )
              })
            )}
          </section>
        </div>
      )}
    </NeonBackground>
  )
}

export default QuizSessionPage
