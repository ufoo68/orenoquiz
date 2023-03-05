import type { FC } from 'react'
import { useState } from 'react'
import { api } from '../../utils/api'

type Props = {
  sessionId: string
  handleQuizStart: () => void
}

export const EntriesCard: FC<Props> = ({ sessionId, handleQuizStart }) => {
  const [entriesCount, setEntriesCount] = useState<number>(0)
  api.quizParticipant.getAllCount.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setEntriesCount(res)
      },
    }
  )
  return (
    <div className="stats shadow">
      <div className="stat">
        <div className="stat-title">参加者、</div>
        <div className="stat-value">{entriesCount}</div>
        <button className="btn mt-5" onClick={handleQuizStart}>クイズスタート</button>
      </div>
    </div>
  )
}
