import type { FC } from 'react'
import { useState } from 'react'
import type { QuizSessionState } from '../../types/quizSession'
import { getQuizSessionStateEntry } from '../../types/quizSession'
import { api } from '../../utils/api'
import { AnswerCard } from './AnswerCard'
import { EntriesCard } from './EntriesCard'
import { QuestionCard } from './QuestionCard'

type Props = {
  sessionId: string
}

export const Container: FC<Props> = ({ sessionId }) => {
  const [state, setState] = useState<QuizSessionState>(
    getQuizSessionStateEntry()
  )
  const getState = api.quizSession.getState.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setState(res)
      },
    }
  )
  const updateStateStart = api.quizSession.updateStateStart.useMutation()
  const updateStateAnswer = api.quizSession.updateStateAnswer.useMutation()
  const handleQuizStart = async () => {
    await updateStateStart.mutateAsync({ sessionId })
    await getState.refetch()
  }
  const handleQuizAnswer = async (questionId: string) => {
    await updateStateAnswer.mutateAsync({ sessionId, questionId })
    await getState.refetch()
  }
  if (state.type === 'entry') {
    return (
      <EntriesCard sessionId={sessionId} handleQuizStart={handleQuizStart} />
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
    return <AnswerCard sessionId={sessionId} questionId={state.questionId} />
  }
  return null
}
