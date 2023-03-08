import type { FC } from 'react'

export const EndCard: FC = () => {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body flex flex-col items-center">
        <h2 className="card-title">
          このクイズは終了しました
        </h2>
        <p>
          お疲れ様でした。またのご参加お待ちしております。
        </p>
      </div>
    </div>
  )
}
