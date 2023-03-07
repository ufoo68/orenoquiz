import type { FC } from 'react'
import { useState } from 'react'
import { api } from '../../utils/api'

type Props = {
  sessionId: string
  questionId: string
  participantId: string
}

export const ResultCard: FC<Props> = ({
  questionId,
  sessionId,
  participantId,
}) => {
  const [isWin, setIsWin] = useState<boolean>(false)
  const [winCount, setWinCount] = useState<number>(0)
  const [name, setName] = useState<string>('')
  api.quizParticipant.getWinCount.useQuery(
    { participantId, sessionId },
    {
      onSuccess: (res) => {
        setWinCount(res)
      },
    }
  )
  api.quizParticipant.getName.useQuery(
    { participantId },
    {
      onSuccess: (res) => {
        setName(res)
      },
    }
  )
  api.quizParticipant.getIsWin.useQuery({participantId, sessionId, questionId}, {
    onSuccess: (res) => {
      setIsWin(res)
    }
  })
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body flex flex-col items-center">
        <h2 className="card-title">
          {name}さん、{isWin ? '正解😄' : '残念😅'}
        </h2>
        <div className="stat text-center">
          <div className="stat-title">これまでの正解数</div>
          <div className="stat-value">{winCount}</div>
        </div>
      </div>
    </div>
  )
}
