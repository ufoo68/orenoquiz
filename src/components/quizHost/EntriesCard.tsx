import type { FC } from 'react'
import { useState } from 'react'
import { api } from '../../utils/api'
import { useQRCode } from 'next-qrcode'

type Props = {
  sessionId: string
  handleQuizStart: () => void
}

export const EntriesCard: FC<Props> = ({ sessionId, handleQuizStart }) => {
  const [entriesCount, setEntriesCount] = useState<number>(0)
  const { Canvas } = useQRCode()
  api.quizParticipant.getAllCount.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setEntriesCount(res)
      },
    }
  )
  return (
    <div className="card flex w-1/2 flex-col bg-base-100 shadow-xl">
      <div className="flex w-full justify-center">
        <Canvas
          text={`https://orenoquiz.vercel.app/quiz/participant/${sessionId}`}
          options={{
            scale: 8,
          }}
        />
      </div>
      <div className="card-body">
        <div className="stat text-center">
          <div className="stat-title">現在参加者、</div>
          <div className="stat-value">{entriesCount}</div>
          <button className="btn mt-5" onClick={handleQuizStart}>
            クイズスタート
          </button>
        </div>
      </div>
    </div>
  )
}
