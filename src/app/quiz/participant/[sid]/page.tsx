'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AnswerForm } from '../../../../components/quizParticipant/AnswerForm'
import { EntryForm } from '../../../../components/quizParticipant/EntryForm'
import { ResultCard } from '../../../../components/quizParticipant/ResultCard'
import { ScoreCard } from '../../../../components/quizParticipant/ScoreCard'
import { EndCard } from '../../../../components/common/EndCard'
import type { QuizSessionState } from '../../../../types/quizSession'
import { getQuizSessionStateEntry } from '../../../../types/quizSession'
import { api } from '../../../../utils/api'

type PageProps = {
  params: {
    sid: string
  }
}

const QuizParticipantPage = ({ params }: PageProps) => {
  const { sid: sessionId } = params
  const searchParams = useSearchParams()
  const router = useRouter()
  const [participantId, setParticipantId] = useState<string>(searchParams?.get('pid') ?? '')
  const [state, setState] = useState<QuizSessionState>(getQuizSessionStateEntry())
  const [networkError, setNetworkError] = useState(false)

  useEffect(() => {
    setParticipantId(searchParams?.get('pid') ?? '')
  }, [searchParams])

  api.quizSession.getState.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        if (res) {
          setState(res)
        }
        setNetworkError(false)
      },
      onError: () => {
        setNetworkError(true)
      },
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )

  const createParticipant = api.quizParticipant.create.useMutation()

  const handleSubmitName = async (name: string) => {
    if (!participantId) {
      const pid = await createParticipant.mutateAsync({ sessionId, name })
      await router.replace(`/quiz/participant/${sessionId}?pid=${pid}`)
      setParticipantId(pid)
      window.alert('参加しました。クイズ開始までお待ち下さい。')
    }
  }

  return (
    <div className="m-0 flex h-[99vh] w-screen items-center justify-center overflow-y-hidden bg-neutral-200 p-4">
      {networkError && (
        <div role="alert" className="alert alert-error fixed top-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>インターネットが接続されていません</span>
        </div>
      )}
      {(() => {
        if (state.type === 'entry' || !participantId) {
          return (
            <EntryForm participantId={participantId} handleSubmitName={handleSubmitName} />
          )
        } else if (state.type === 'question') {
          return (
            <AnswerForm
              sessionId={sessionId}
              participantId={participantId}
              questionId={state.questionId}
            />
          )
        } else if (state.type === 'answer') {
          return (
            <ResultCard
              sessionId={sessionId}
              participantId={participantId}
              questionId={state.questionId}
            />
          )
        } else if (state.type === 'rank') {
          return <ScoreCard sessionId={sessionId} participantId={participantId} />
        } else if (state.type === 'end') {
          return <EndCard />
        }
        return <>error</>
      })()}
    </div>
  )
}

export default QuizParticipantPage
