'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

import { ConfigForm } from '../../components/ishindenshin/ConfigForm'
import { NeonBackground } from '../../components/common/NeonBackground'
import { api } from '../../utils/api'
import { type IshinDenshinConfig } from '../../types/ishindenshin'

const IshindenshinPage = () => {
  const createIshindenshin = api.ishindenshin.create.useMutation()
  const allIshindenshin = api.ishindenshin.getAll.useQuery()
  const deleteIshindenshin = api.ishindenshin.delete.useMutation()
  const resetSession = api.ishindenshin.versionReset.useMutation()
  const updateConfig = api.ishindenshin.updateConfig.useMutation()
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/')
    }
  }, [router, status])

  const handleCreateIshindenshin = async () => {
    await createIshindenshin.mutateAsync()
    await allIshindenshin.refetch()
  }

  const handleDeleteIshindenshin = async (sessionId: string) => {
    await deleteIshindenshin.mutateAsync({ sessionId })
    await allIshindenshin.refetch()
  }

  const handleResetSession = async (sessionId: string) => {
    await resetSession.mutateAsync({ sessionId })
    await allIshindenshin.refetch()
  }

  const handleSaveConfig = async (sessionId: string, config: IshinDenshinConfig) => {
    await updateConfig.mutateAsync({ sessionId, config })
    await allIshindenshin.refetch()
  }

  const isLoading = status === 'loading' || allIshindenshin.isLoading
  const sessions = allIshindenshin.data ?? []

  return (
    <NeonBackground>
      {isLoading ? (
        <div className="flex min-h-screen items-center justify-center">
          <progress className="progress progress-primary w-64" />
        </div>
      ) : (
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-5 py-10">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-300">Ishin Denshin Control</p>
              <h1 className="text-3xl font-bold text-white">以心伝心ゲームのセッション管理</h1>
              <p className="text-sm text-slate-400">参加者端末・司会・会場ビューのリンクをここから発行します。</p>
            </div>
            <button
              className="rounded-full border border-white/30 px-5 py-2 text-sm text-white"
              onClick={() => router.push('/')}
            >
              トップへ戻る
            </button>
          </header>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">登録済みセッション: {sessions.length}</p>
            <button
              className="rounded-full border border-emerald-400 px-5 py-2 text-sm text-emerald-200"
              onClick={() => {
                handleCreateIshindenshin().catch((error) => console.error(error))
              }}
            >
              新しくセッションを作成
            </button>
          </div>

          <div className="space-y-6">
            {sessions.length === 0 ? (
              <div className="glass-panel p-10 text-center text-white">
                まだセッションがありません。「新しくセッションを作成」を押してセットアップを開始してください。
              </div>
            ) : (
              sessions.map((session) => {
                const config = session.config as IshinDenshinConfig
                return (
                  <article key={session.id} className="glass-panel space-y-5 p-6 text-white">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Session ID</p>
                        <p className="text-2xl font-bold">{session.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200">
                          {session.state}
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                          ver.{session.version}
                        </span>
                        <button
                          className="rounded-full border border-rose-400 px-3 py-1 text-xs text-rose-200"
                          onClick={() => {
                            handleDeleteIshindenshin(session.id).catch((error) => console.error(error))
                          }}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                    <ConfigForm sessionId={session.id} config={config} onSubmit={handleSaveConfig} />
                    <div className="flex flex-wrap gap-3 text-sm">
                      <Link
                        href={`/ishindenshin/answere/${session.id}/groom`}
                        target="_blank"
                        className="rounded-full border border-white/20 px-4 py-2"
                      >
                        {config.participants?.groomName}
                      </Link>
                      <Link
                        href={`/ishindenshin/answere/${session.id}/bride`}
                        target="_blank"
                        className="rounded-full border border-white/20 px-4 py-2"
                      >
                        {config.participants?.brideName}
                      </Link>
                      <Link
                        href={`/ishindenshin/host/${session.id}`}
                        target="_blank"
                        className="rounded-full border border-white/20 px-4 py-2"
                      >
                        司会画面
                      </Link>
                      <Link
                        href={`/ishindenshin/board/${session.id}`}
                        target="_blank"
                        className="rounded-full border border-white/20 px-4 py-2"
                      >
                        会場表示
                      </Link>
                      <Link
                        href={`/ishindenshin/result/${session.id}`}
                        target="_blank"
                        className="rounded-full border border-white/20 px-4 py-2"
                      >
                        結果一覧
                      </Link>
                      <button
                        className="rounded-full border border-white/20 px-4 py-2"
                        onClick={() => {
                          handleResetSession(session.id).catch((error) => console.error(error))
                        }}
                      >
                        リセット
                      </button>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </div>
      )}
    </NeonBackground>
  )
}

export default IshindenshinPage
