import type { FC } from 'react'
import { useEffect } from 'react'
import { Fragment } from 'react'
import { useState } from 'react'
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
  const [playSoundQuestion] = useSound('/sound/question.mp3')
  const [playSoundAnswer] = useSound('/sound/show.mp3')
  const [playSoundRank] = useSound('/sound/rank.mp3')
  const getState = api.quizSession.getState.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setState(res)
      },
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
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
  return (
    <Fragment>
      {(() => {
        if (state.type === 'entry') {
          return (
            <EntriesCard
              sessionId={sessionId}
              handleQuizStart={handleQuizStart}
            />
          )
        } else if (state.type === 'question') {
          return (
            <QuestionCard
              sessionId={sessionId}
              questionId={state.questionId}
              handleQuizAnswer={handleQuizAnswer}
            />
          )
        } else if (state.type === 'answer') {
          return (
            <AnswerCard
              sessionId={sessionId}
              questionId={state.questionId}
              handleNextQuestion={handleNextQuestion}
              handleShowRank={handleShowRank}
            />
          )
        } else if (state.type === 'rank') {
          return <RankCard sessionId={sessionId} />
        } else if (state.type === 'end') {
          return <EndCard />
        }
        return <>error</>
      })()}
      <div
        className={`absolute bottom-0 flex h-20 w-full items-center justify-center ${
          enableSoundPlay ? 'hidden' : ''
        }`}
      >
        <button className="btn" onClick={() => setEnableSoundPlay(true)}>
          効果音の再生を許可
        </button>
      </div>
    </Fragment>
  )
}
