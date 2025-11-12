'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { AnswerForm } from '../../../../components/quizParticipant/AnswerForm'
import { EntryForm } from '../../../../components/quizParticipant/EntryForm'
import { ResultCard } from '../../../../components/quizParticipant/ResultCard'
import { ScoreCard } from '../../../../components/quizParticipant/ScoreCard'
import { EndCard } from '../../../../components/common/EndCard'
import { NeonBackground } from '../../../../components/common/NeonBackground'
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
  const [participantId, setParticipantId] = useState<string>(
    searchParams?.get('pid') ?? ''
  )
  const [state, setState] = useState<QuizSessionState>(
    getQuizSessionStateEntry()
  )
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
      refetchInterval: 1000,
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

  const stageLabel = useMemo(() => {
    switch (state.type) {
      case 'entry':
        return 'ENTRY'
      case 'question':
        return 'QUESTION'
      case 'answer':
        return 'ANSWER CHECK'
      case 'rank':
        return 'RANKING'
      case 'end':
        return 'FINALE'
      default:
        return 'SESSION'
    }
  }, [state.type])

  const renderContent = () => {
    if (state.type === 'entry' || !participantId) {
      return (
        <EntryForm
          participantId={participantId}
          handleSubmitName={handleSubmitName}
        />
      )
    }
    if (state.type === 'question') {
      return (
        <AnswerForm
          sessionId={sessionId}
          participantId={participantId}
          questionId={state.questionId}
        />
      )
    }
    if (state.type === 'answer') {
      return (
        <ResultCard
          sessionId={sessionId}
          participantId={participantId}
          questionId={state.questionId}
        />
      )
    }
    if (state.type === 'rank') {
      return <ScoreCard sessionId={sessionId} participantId={participantId} />
    }
    if (state.type === 'end') {
      return <EndCard />
    }
    return <div className="text-white">error</div>
  }

  return (
    <NeonBackground>
      {networkError && (
        <div className="alert alert-error fixed left-1/2 top-5 z-40 w-[90vw] max-w-md -translate-x-1/2 bg-rose-600/90 text-white shadow-lg shadow-rose-500/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0"
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
          <span>
            ネットワークから切断されました。通信環境をご確認ください。
          </span>
        </div>
      )}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-5 py-10">
        <header className="mb-8 flex w-full flex-col items-center text-center text-white">
          <span className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.4em] text-amber-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            {stageLabel}
          </span>
        </header>
        <div className="flex w-full flex-1 items-center justify-center pb-10">
          {renderContent()}
        </div>
      </div>
    </NeonBackground>
  )
}

export default QuizParticipantPage
