import type { FC } from 'react'
import { useState } from 'react'

type Props = {
  handleSubmitName: (name: string) => void
}

export const EntryForm: FC<Props> = ({ handleSubmitName }) => {
  const [name, setName] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
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
