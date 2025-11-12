'use client'

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
  api.quizParticipant.getIsWin.useQuery(
    { participantId, sessionId, questionId },
    {
      onSuccess: (res) => {
        setIsWin(res)
      },
    }
  )
  return (
    <div className="glass-panel w-full max-w-lg space-y-4 p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Result</p>
          <h2 className="text-3xl font-bold text-white">
            {name}さん、{isWin ? '正解！' : '残念...'}
          </h2>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total Wins</p>
        <p className="mt-2 text-5xl font-black text-white">{winCount}</p>
      </div>
    </div>
  )
}
