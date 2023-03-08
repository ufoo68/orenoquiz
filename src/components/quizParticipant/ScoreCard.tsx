import type { FC } from 'react'
import { useState } from 'react'
import { api } from '../../utils/api'

type Props = {
  sessionId: string
  participantId: string
}

export const ScoreCard: FC<Props> = ({
  sessionId,
  participantId,
}) => {
  const [winCount, setWinCount] = useState<number>(0)
  const [name, setName] = useState<string>('')
  const [rank, setRank] = useState<number>(0)
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
  api.quizSession.getTotalScore.useQuery({sessionId}, {
    onSuccess: (res) => {
      setRank(res.find((rank) => rank.id === participantId)?.rank ?? 0)
    }
  })
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body flex flex-col items-center">
        <h2 className="card-title">
          {name}さんの順位は、{rank}位でした。
        </h2>
        <div className="stat text-center">
          <div className="stat-title">これまでの正解数</div>
          <div className="stat-value">{winCount}</div>
        </div>
      </div>
    </div>
  )
}
