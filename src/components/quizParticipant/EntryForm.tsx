import type { FC } from 'react'

type Props = {
  name: string
  participantId: string
  handleChangeName: (name: string) => void
  handleSubmitName: () => void
}

export const EntryForm: FC<Props> = ({
  name,
  participantId,
  handleChangeName,
  handleSubmitName,
}) => {
  return (
    <form className=" w-3/4 rounded bg-white p-8 shadow-md">
      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          参加者名
        </label>
        <input
          className="input-bordered input w-full"
          type="text"
          value={name}
          onChange={(e) => {
            handleChangeName(e.target.value)
          }}
          disabled={Boolean(participantId)}
        />
      </div>
      <div className="flex justify-end space-x-5">
        <button
          className="btn-primary btn"
          type="button"
          onClick={handleSubmitName}
          disabled={Boolean(participantId)}
        >
          参加する
        </button>
      </div>
    </form>
  )
}
