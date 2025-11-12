'use client'

import type { FC } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { QuizSessionState } from '../../types/quizSession'
import { getQuizSessionStateEntry } from '../../types/quizSession'
import { api } from '../../utils/api'
import { EndCard } from '../common/EndCard'
import { AnswerCard } from './AnswerCard'
import { EntriesCard } from './EntriesCard'
import { QuestionCard } from './QuestionCard'
import { RankCard } from './RankCard'
import useSound from 'use-sound'

type Props = {
  sessionId: string
}

export const Container: FC<Props> = ({ sessionId }) => {
  const [enableSoundPlay, setEnableSoundPlay] = useState<boolean>(false)
  const [state, setState] = useState<QuizSessionState>(
    getQuizSessionStateEntry()
  )
  const [networkError, setNetworkError] = useState<boolean>(false)
  const [playSoundQuestion] = useSound('/sound/question.mp3')
  const [playSoundAnswer] = useSound('/sound/show.mp3')
  const [playSoundRank] = useSound('/sound/rank.mp3')
  const getState = api.quizSession.getState.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setState(res)
        setNetworkError(false)
      },
      onError: () => {
        setNetworkError(true)
      },
      refetchInterval: 1000,
    }
  )
  const updateStateStart = api.quizSession.updateStateStart.useMutation()
  const updateStateAnswer = api.quizSession.updateStateAnswer.useMutation()
  const updateStateNextQuestion =
    api.quizSession.updateStateNextQuestion.useMutation()
  const updateStateRank = api.quizSession.updateStateRank.useMutation()
  const handleQuizStart = async () => {
    await updateStateStart.mutateAsync({ sessionId })
    await getState.refetch()
  }
  const handleQuizAnswer = async (questionId: string) => {
    await updateStateAnswer.mutateAsync({ sessionId, questionId })
    await getState.refetch()
  }
  const handleNextQuestion = async (questionId: string) => {
    await updateStateNextQuestion.mutateAsync({ sessionId, questionId })
    await getState.refetch()
  }
  const handleShowRank = async () => {
    await updateStateRank.mutateAsync({ sessionId })
    await getState.refetch()
  }
  useEffect(() => {
    if (enableSoundPlay && state.type === 'question') {
      playSoundQuestion()
    } else if (enableSoundPlay && state.type === 'answer') {
      playSoundAnswer()
    } else if (enableSoundPlay && state.type === 'rank') {
      playSoundRank()
    }
  }, [state, enableSoundPlay])
  const stageLabel = useMemo(() => {
    switch (state.type) {
      case 'entry':
        return '受付中'
      case 'question':
        return '出題中'
      case 'answer':
        return '回答確認'
      case 'rank':
        return 'ランキング'
      case 'end':
        return '終了'
      default:
        return '待機'
    }
  }, [state.type])

  const renderCard = () => {
    if (state.type === 'entry') {
      return (
        <EntriesCard sessionId={sessionId} handleQuizStart={handleQuizStart} />
      )
    }
    if (state.type === 'question') {
      return (
        <QuestionCard
          sessionId={sessionId}
          questionId={state.questionId}
          handleQuizAnswer={handleQuizAnswer}
        />
      )
    }
    if (state.type === 'answer') {
      return (
        <AnswerCard
          sessionId={sessionId}
          questionId={state.questionId}
          handleNextQuestion={handleNextQuestion}
          handleShowRank={handleShowRank}
        />
      )
    }
    if (state.type === 'rank') {
      return <RankCard sessionId={sessionId} />
    }
    if (state.type === 'end') {
      return <EndCard />
    }
    return <div className="text-white">error</div>
  }

  return (
    <div className="flex h-full flex-col gap-4 text-white">
      {networkError && (
        <div className="alert alert-error border border-rose-400/50 bg-rose-600/90 text-white shadow-lg shadow-rose-500/30">
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

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Stage
          </p>
          <p className="text-lg font-semibold text-white">{stageLabel}</p>
        </div>
        <div>
          <button
            className="btn btn-sm border-white/20 bg-white/5 text-white"
            onClick={() => setEnableSoundPlay(true)}
            disabled={enableSoundPlay}
          >
            {enableSoundPlay ? '効果音オン' : '効果音を許可'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">{renderCard()}</div>
    </div>
  )
}
