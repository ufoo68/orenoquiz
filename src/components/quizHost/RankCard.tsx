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

  return (
    <div className="card flex w-10/12 flex-col bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="stat text-center">
          <div className="stat-title text-2xl">結果発表</div>
          <div className="max-h-[50vh] overflow-y-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>順位</th>
                  <th>名前</th>
                  <th>正解数</th>
                </tr>
              </thead>
              <tbody className="text-2xl">
                {ranks.map((rank) => (
                  <tr key={rank.id}>
                    <th>{rank.rank}</th>
                    <td>{rank.name}</td>
                    <td>{rank.winCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
