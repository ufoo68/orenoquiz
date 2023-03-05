import type { FC } from 'react'

type Props = {
  participantId: string
}

export const AnswerForm: FC<Props> = () => {
  return (
    <form className=" w-3/4 rounded bg-white p-8 shadow-md">
      <div className="flex justify-end space-x-5">
        <button className="btn-primary btn" type="button">
          回答する
        </button>
      </div>
    </form>
  )
}
