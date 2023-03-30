import type { QuizSession } from '@prisma/client'
import { type NextPage } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { api } from '../../../utils/api'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

type Props = {
  masterId: string
}

const Session: NextPage<Props> = ({ masterId }) => {
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
  const deleteQuiz = api.quizSession.delete.useMutation()
  const resetSession = api.quizSession.updateStateReset.useMutation()

  const handleCreateSession = async () => {
    await createSession.mutateAsync({ masterId })
    await getAllSession.refetch()
  }

  const handleDeleteSession = async (sessionId: string) => {
    await deleteQuiz.mutateAsync({ sessionId })
    await getAllSession.refetch()
  }

  const handleResetSession = async (sessionId: string) => {
    await resetSession.mutateAsync({ sessionId })
    await getAllSession.refetch()
  }

  if (getAllSession.isLoading) {
    return <progress className="progress" />
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-5 bg-neutral-200">
      {sessions.map((session) => (
        <div key={session.id} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex justify-between">
              {session.id}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8 cursor-pointer"
                onClick={() => {
                  handleDeleteSession(session.id).catch((e) => console.error(e))
                }}
              >
                <path
                  fillRule="evenodd"
                  d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                  clipRule="evenodd"
                />
              </svg>
            </h2>
            <p>{JSON.stringify(session.state)}</p>
            <div className="card-actions justify-end">
              <Link
                href={`/quiz/participant/${session.id}`}
                legacyBehavior
                passHref
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-primary  link"
                >
                  <button className="btn-primary btn">参加者</button>
                </a>
              </Link>
              <Link href={`/quiz/host/${session.id}`} legacyBehavior passHref>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-primary  link"
                >
                  <button className="btn-primary btn">司会</button>
                </a>
              </Link>
              <button
                className="btn-primary btn"
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
        className="btn-secondary btn"
        onClick={() => {
          handleCreateSession().catch((e) => {
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

export const getServerSideProps = (
  context: GetServerSidePropsContext
): GetServerSidePropsResult<Props> => {
  const { mid } = context.query
  if (typeof mid !== 'string') {
    return { notFound: true }
  }
  return { props: { masterId: mid } }
}

export default Session
