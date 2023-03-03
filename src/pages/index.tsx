import { type NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
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
    imageUrl: '/quiz.jpg',
    link: '/quiz',
  },
  {
    title: '以心伝心ゲーム',
    description: 'ホワイトボードを使って二人の息を揃えるゲームです',
    imageUrl: '/ishindenshin.jpg',
    link: '/ishindenshin',
  },
]

const Home: NextPage = () => {
  const [cardIndex, setCardIndex] = useState<number>(0)
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-5 bg-neutral-200">
      <div className="h-2/3 flex items-center">
        <div className="card w-80 bg-base-100 shadow-xl">
          <figure>
            <Image
              width={400}
              height={200}
              src={selectCards[cardIndex]?.imageUrl ?? ''}
              alt="ishindenshin"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">{selectCards[cardIndex]?.title}</h2>
            <p>{selectCards[cardIndex]?.description}</p>
            <div className="card-actions justify-end">
              <Link href={selectCards[cardIndex]?.link ?? ''}>
                <button className="btn btn-primary">このゲームを遊ぶ</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="btn-group">
        <button
          className="btn"
          disabled={cardIndex === 0}
          onClick={() => {
            setCardIndex(cardIndex - 1)
          }}
        >
          «
        </button>
        <button className="btn">{cardIndex + 1}</button>
        <button
          className="btn"
          disabled={cardIndex + 1 === selectCards.length}
          onClick={() => {
            setCardIndex(cardIndex + 1)
          }}
        >
          »
        </button>
      </div>
    </div>
  )
}

export default Home
