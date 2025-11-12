'use client'

import type { FC } from 'react'
import { useState } from 'react'
import { api } from '../../utils/api'

type Props = {
  sessionId: string
}

type Rank = {
  id: string
  name: string
  rank: number
  winCount: number
}

export const RankCard: FC<Props> = ({ sessionId }) => {
  const [ranks, setRanks] = useState<Rank[]>([])
  api.quizSession.getTotalScore.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setRanks(res)
      },
    }
  )

  const topThree = ranks.slice(0, 3)
  const rest = ranks.slice(3)

  const gradientByRank = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-slate-900 text-white'
      case 2:
        return 'bg-slate-800 text-white'
      case 3:
        return 'bg-slate-700 text-white'
      default:
        return 'bg-white/5 text-white'
    }
  }

  return (
    <div className="glass-panel w-full space-y-6 p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Ranking
          </p>
          <h2 className="text-3xl font-bold">最終結果</h2>
        </div>
        <span className="rounded-full bg-white/10 px-4 py-1 text-sm text-amber-200">
          TOP {ranks.length}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {topThree.map((rank) => (
          <div
            key={rank.id}
            className={`rounded-3xl ${gradientByRank(rank.rank)} p-5 shadow-lg`}
          >
            <p className="text-sm uppercase tracking-[0.4em]">
              Rank {rank.rank}
            </p>
            <p className="mt-2 text-2xl font-black">{rank.name}</p>
            <p className="text-sm">正解数 {rank.winCount}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {rest.map((rank) => (
          <div
            key={rank.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-lg"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl font-semibold text-amber-300">
                {rank.rank}
              </span>
              <span className="text-white">{rank.name}</span>
            </div>
            <span className="font-semibold text-white">{rank.winCount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
