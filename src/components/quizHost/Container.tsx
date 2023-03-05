import type { FC } from 'react'
import { useState } from 'react'
import type { QuizSessionState } from '../../types/quizSession'
import { getQuizSessionStateEntry } from '../../types/quizSession'
import { api } from '../../utils/api'
import { EntriesCard } from './EntriesCard'

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
  const handleQuizStart = async () => {
    await updateStateStart.mutateAsync({ sessionId })
    await getState.refetch()
  }
  if (state.type === 'entry') {
    return (
      <EntriesCard sessionId={sessionId} handleQuizStart={handleQuizStart} />
    )
  } else if (state.type === 'question') {
    return <div>問題表示画面</div>
  }
  return null
}
