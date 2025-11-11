'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

import { ConfigForm } from '../../components/ishindenshin/ConfigForm'
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

  if (status === 'loading' || !allIshindenshin.data) {
    return <progress className="progress" />
  }

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center space-y-5 overflow-y-auto bg-neutral-200 p-4">
      <button className="btn absolute top-10 right-10" onClick={() => router.push('/')}>
        トップ画面
      </button>
      {allIshindenshin.data.map((session) => {
        const config = session.config as IshinDenshinConfig
        return (
          <div key={session.id} className="card w-full max-w-4xl bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <div className="badge badge-secondary">{session.state}</div>
                <div className="badge">ver:{session.version}</div>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    handleDeleteIshindenshin(session.id).catch((error) => console.error(error))
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path
                      fillRule="evenodd"
                      d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </h2>
              <ConfigForm sessionId={session.id} config={config} onSubmit={handleSaveConfig} />
              <div className="card-actions flex-wrap justify-end gap-3">
                <Link
                  href={`/ishindenshin/answere/${session.id}/groom`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {config.participants?.groomName}
                </Link>
                <Link
                  href={`/ishindenshin/answere/${session.id}/bride`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {config.participants?.brideName}
                </Link>
                <Link
                  href={`/ishindenshin/host/${session.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  司会
                </Link>
                <Link
                  href={`/ishindenshin/board/${session.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  会場
                </Link>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleResetSession(session.id).catch((error) => console.error(error))
                  }}
                >
                  リセット
                </button>
              </div>
            </div>
          </div>
        )
      })}
      {allIshindenshin.data.length === 0 && (
        <button
          className="btn btn-secondary"
          onClick={() => {
            handleCreateIshindenshin().catch((error) => console.error(error))
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
      )}
    </div>
  )
}

export default IshindenshinPage
