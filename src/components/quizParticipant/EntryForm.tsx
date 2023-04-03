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
    <form className="w-96 rounded bg-white p-8 shadow-md">
      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          参加者名
        </label>
        <input
          className="input-bordered input w-full"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end space-x-5">
        <button
          className="btn-primary btn"
          type="button"
          onClick={() => {
            const isOk = window.confirm('この名前で参加しますか？')
            if (!isOk) return
            handleSubmitName(name)
            setIsSubmitting(true)
          }}
          disabled={isSubmitting || !Boolean(name)}
        >
          参加する
        </button>
      </div>
    </form>
  )
}
