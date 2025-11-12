'use client'

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
      refetchInterval: 1000,
    }
  )
  return (
    <div className="glass-panel w-full space-y-10 p-10 text-white">
      <div className="flex flex-col items-center text-center">
        <p className="text-sm uppercase tracking-[0.6em] text-slate-300">
          Entry Mode
        </p>
        <h2 className="mt-3 text-4xl font-black">参加者を受付中</h2>
        <p className="mt-2 text-lg text-slate-200">
          画面のQRコードを会場モニターに映してください
        </p>
        <div className="mt-6 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-2xl font-bold text-amber-300">
          参加者 {entriesCount} 人
        </div>
      </div>
      <div className="flex justify-center">
        <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-2xl">
          <Canvas
            text={`https://orenoquiz.vercel.app/quiz/participant/${sessionId}`}
            options={{
              margin: 1,
              scale: 10,
            }}
          />
        </div>
      </div>
      <button
        className="btn w-full border-0 bg-gradient-to-r from-emerald-400 to-sky-500 text-2xl font-bold text-slate-900 shadow-lg shadow-emerald-500/30"
        onClick={handleQuizStart}
      >
        クイズスタート
      </button>
    </div>
  )
}
