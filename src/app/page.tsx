'use client'

import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

type SelectCard = {
  title: string
  description: string
  imageUrl: string
  link: string
}

const selectCards: SelectCard[] = [
  {
    title: 'シンプルクイズ',
    description: 'シンプルなクイズゲームです',
    imageUrl: '/image/quiz.jpg',
    link: '/quiz',
  },
  {
    title: '以心伝心ゲーム',
    description: 'ホワイトボードを使って二人の息を揃えるゲームです',
    imageUrl: '/image/ishindenshin.jpg',
    link: '/ishindenshin',
  },
]

const HomePage = () => {
  const [cardIndex, setCardIndex] = useState(0)
  const { data: session } = useSession()

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-5 bg-neutral-200">
      <button
        className="btn absolute top-10 right-10"
        onClick={() => (session ? signOut() : signIn('line'))}
      >
        {session ? 'ログアウト' : 'ログイン'}
      </button>
      <div className="flex h-2/3 items-center">
        <div className="card w-80 bg-base-100 shadow-xl">
          <figure>
            <img
              className="w-full"
              src={selectCards[cardIndex]?.imageUrl ?? ''}
              alt={selectCards[cardIndex]?.title ?? ''}
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">{selectCards[cardIndex]?.title}</h2>
            <p>{selectCards[cardIndex]?.description}</p>
            <div className="card-actions justify-end">
              {session ? (
                <Link href={selectCards[cardIndex]?.link ?? ''} className="btn btn-primary">
                  このゲームを遊ぶ
                </Link>
              ) : (
                <button className="btn btn-primary" onClick={() => signIn('line')}>
                  ログインしてください
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="btn-group">
        <button
          className="btn"
          disabled={cardIndex === 0}
          onClick={() => {
            setCardIndex((prev) => prev - 1)
          }}
        >
          «
        </button>
        <button className="btn">{cardIndex + 1}</button>
        <button
          className="btn"
          disabled={cardIndex + 1 === selectCards.length}
          onClick={() => {
            setCardIndex((prev) => prev + 1)
          }}
        >
          »
        </button>
      </div>
    </div>
  )
}

export default HomePage
