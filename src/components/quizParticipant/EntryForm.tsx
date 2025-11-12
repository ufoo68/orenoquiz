'use client'

import type { FC } from 'react'
import { useState } from 'react'
import { api } from '../../utils/api'

type Props = {
  participantId: string
  handleSubmitName: (name: string) => void
}

export const EntryForm: FC<Props> = ({ handleSubmitName, participantId }) => {
  const [name, setName] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(
    Boolean(participantId)
  )
  api.quizParticipant.getName.useQuery(
    { participantId },
    {
      onSuccess: (res) => {
        setName(res)
      },
    }
  )
  return (
    <form className="glass-panel relative w-full max-w-md space-y-6 p-8 text-white shadow-2xl">
      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-slate-200/80">
          コードネーム
        </label>
        <input
          className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
          placeholder="例) NORU_01"
          disabled={isSubmitting}
        />
        <p className="mt-2 text-xs text-slate-300/80">
          画面に表示されるあだ名を入力してください。
        </p>
      </div>
      <div className="flex justify-end">
        <button
          className="btn border-0 bg-gradient-to-r from-amber-400 to-pink-500 text-slate-900 shadow-xl shadow-amber-500/30"
          type="button"
          onClick={() => {
            const isOk = window.confirm('この名前で参加しますか？')
            if (!isOk) return
            Promise.resolve(handleSubmitName(name)).catch((error) => console.error(error))
            setIsSubmitting(true)
          }}
          disabled={isSubmitting || !Boolean(name)}
        >
          {isSubmitting ? '待機中...' : 'エントリーする'}
        </button>
      </div>
    </form>
  )
}
