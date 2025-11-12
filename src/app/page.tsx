'use client'

import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

import { NeonBackground } from '../components/common/NeonBackground'

type SelectCard = {
  title: string
  description: string
  imageUrl: string
  link: string
}

const selectCards: SelectCard[] = [
  {
    title: 'シンプルクイズ',
    description: '早押し・並べ替えに対応したシンプルなクイズモードです。',
    imageUrl: '/image/quiz.jpg',
    link: '/quiz',
  },
  {
    title: '以心伝心ゲーム',
    description: 'ホワイトボード風の回答で、二人の息を合わせる演出に。',
    imageUrl: '/image/ishindenshin.jpg',
    link: '/ishindenshin',
  },
]

const HomePage = () => {
  const { data: session } = useSession()

  return (
    <NeonBackground>
      <div className="min-h-screen text-white">
        <header className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">oreno quiz hub</h1>
            <p className="text-sm text-slate-300">
              ブラウザで完結するパーティーゲームプラットフォーム
            </p>
          </div>
          <button
            className="rounded-full border border-white/40 px-5 py-2 text-sm"
            onClick={() => (session ? signOut() : signIn())}
          >
            {session ? 'ログアウト' : 'ログイン'}
          </button>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-5 pb-16">
          <section className="grid gap-8 lg:grid-cols-2 text-white">
            {selectCards.map((card) => (
              <div
                className="rounded-3xl border border-white/15 bg-white/5 p-6 text-white shadow-lg"
                key={card.title}
              >
                <figure className="overflow-hidden rounded-2xl border border-white/20">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="h-56 w-full object-cover"
                  />
                </figure>
                <div className="mt-4 space-y-2">
                  <h3 className="text-2xl font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-300">{card.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <Link
                    href={card.link}
                    target="_blank"
                    className="btn border-white/20 bg-white/5 text-white"
                  >
                    このゲームを選択
                  </Link>
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </NeonBackground>
  )
}

export default HomePage
