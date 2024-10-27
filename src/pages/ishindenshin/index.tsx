import { type NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '../../utils/api'
import { useEffect } from 'react'

const Ishindenshin: NextPage = () => {
  const createIshindenshin = api.ishindenshin.create.useMutation()
  const allIshindenshin = api.ishindenshin.getAll.useQuery()
  const deleteIshindenshin = api.ishindenshin.delete.useMutation()
  const resetSession = api.ishindenshin.versionReset.useMutation()
  const { data: session } = useSession()
  const router = useRouter()

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

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [])

  if (!allIshindenshin.data) {
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
      {allIshindenshin.data.map((session) => (
        <div key={session.id} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              <div className="badge-secondary badge">{session.state}</div>
              <div className="badge">ver:{session.version}</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 cursor-pointer"
                onClick={() => {
                  handleDeleteIshindenshin(session.id).catch((e) =>
                    console.error(e)
                  )
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
              <Link
                href={`/ishindenshin/answere/${session.id}?name=groom`}
                legacyBehavior
                passHref
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-primary  link"
                >
                  <button className="btn btn-primary">新郎</button>
                </a>
              </Link>
              <Link
                href={`/ishindenshin/answere/${session.id}?name=bride`}
                legacyBehavior
                passHref
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-primary  link"
                >
                  <button className="btn btn-primary">新婦</button>
                </a>
              </Link>
              <Link
                href={`/ishindenshin/host/${session.id}`}
                legacyBehavior
                passHref
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-primary  link"
                >
                  <button className="btn btn-primary">司会</button>
                </a>
              </Link>
              <Link
                href={`/ishindenshin/board/${session.id}`}
                legacyBehavior
                passHref
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-primary  link"
                >
                  <button className="btn btn-primary">会場</button>
                </a>
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleResetSession(session.id).catch((e) => console.error(e))
                }}
              >
                リセット
              </button>
            </div>
          </div>
        </div>
      ))}
      <button
        className="btn btn-secondary"
        onClick={() => {
          handleCreateIshindenshin().catch((e) => {
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

export default Ishindenshin
