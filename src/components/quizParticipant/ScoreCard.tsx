'use client'

import type { FC } from 'react'
import { useState } from 'react'
import { api } from '../../utils/api'

type Props = {
  sessionId: string
  participantId: string
}

export const ScoreCard: FC<Props> = ({ sessionId, participantId }) => {
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
  api.quizSession.getTotalScore.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setRank(res.find((rank) => rank.id === participantId)?.rank ?? 0)
      },
    }
  )
  return (
    <div className="glass-panel w-full max-w-lg space-y-6 p-8 text-white">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Final Rank</p>
        <p className="mt-2 text-2xl font-bold text-white">
          {name}さんの順位は <span className="text-amber-300">{rank}位</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Rank</p>
          <p className="text-4xl font-black text-white">{rank}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Wins</p>
          <p className="text-4xl font-black text-white">{winCount}</p>
        </div>
      </div>
    </div>
  )
}
