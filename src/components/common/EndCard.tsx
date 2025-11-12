'use client'

import type { FC } from 'react'

export const EndCard: FC = () => {
  return (
    <div className="glass-panel w-full max-w-lg space-y-4 p-8 text-center text-white">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Session</p>
      <h2 className="text-3xl font-bold">このクイズは終了しました</h2>
      <p className="text-slate-200">
        ご参加ありがとうございました。司会者の案内があるまで、そのままお待ちいただくか次のゲームモードをお楽しみください。
      </p>
    </div>
  )
}
