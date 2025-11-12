'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
  IshinDenshinSessionResult,
  IshinDenshinSessionState,
} from '@prisma/client'
import { useRouter } from 'next/navigation'
import useSound from 'use-sound'

import { NeonBackground } from '../../../../components/common/NeonBackground'
import { api } from '../../../../utils/api'

type PageProps = {
  params: {
    id: string
  }
}

const IshindenshinBoardPage = ({ params }: PageProps) => {
  const { id: sessionId } = params
  const [enableSoundPlay, setEnableSoundPlay] = useState(false)
  const [version, setVersion] = useState(1)
  const [state, setState] = useState<IshinDenshinSessionState>('WAIT')
  const [result, setResult] = useState<IshinDenshinSessionResult>('NONE')
  const [networkError, setNetworkError] = useState(false)
  const router = useRouter()
  const [playSoundShow] = useSound('/sound/show.mp3')
  const [playSoundCorrect] = useSound('/sound/correct.mp3')
  const [playSoundIncorrect] = useSound('/sound/incorrect.mp3')

  const groomAnswer = api.ishindenshin.getAnswer.useQuery({
    sessionId,
    version,
    answereName: 'groom',
  })

  const brideAnswer = api.ishindenshin.getAnswer.useQuery({
    sessionId,
    version,
    answereName: 'bride',
  })

  api.ishindenshin.getStatus.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setVersion(res.version)
        setState(res.state)
        setResult(res.result)
        if (res.state === 'SHOW' && res.result === 'NONE') {
          groomAnswer.refetch().catch((error) => console.error(error))
          brideAnswer.refetch().catch((error) => console.error(error))
        }
        setNetworkError(false)
      },
      onError: (error) => {
        console.error(error)
        setNetworkError(true)
      },
      refetchInterval: 1000,
    }
  )

  const { data: config } = api.ishindenshin.getConfig.useQuery({ sessionId })
  const groomName = config?.participants?.groomName ?? '一人目'
  const brideName = config?.participants?.brideName ?? '二人目'

  useEffect(() => {
    if (!enableSoundPlay) return
    if (state === 'SHOW' && result === 'NONE') {
      playSoundShow()
    } else if (state === 'SHOW' && result === 'MATCH') {
      playSoundCorrect()
    } else if (state === 'SHOW' && result === 'NOT_MATCH') {
      playSoundIncorrect()
    }
  }, [
    enableSoundPlay,
    state,
    result,
    playSoundCorrect,
    playSoundIncorrect,
    playSoundShow,
  ])

  useEffect(() => {
    if (state === 'END') {
      router.push(`/ishindenshin/result/${sessionId}`)
    }
  }, [router, sessionId, state])

  const stageLabel = useMemo(() => {
    switch (state) {
      case 'SHOW':
        return 'LIVE MATCH'
      case 'END':
        return 'SHOW ENDED'
      default:
        return 'STANDBY'
    }
  }, [state])

  const groomImageUrl = groomAnswer.data?.boardImageUrl ?? ''
  const brideImageUrl = brideAnswer.data?.boardImageUrl ?? ''
  const hasReveal = state === 'SHOW' && Boolean(groomImageUrl && brideImageUrl)

  const ResultOverlay = () => {
    if (state !== 'SHOW' || result === 'NONE') return null
    const isMatch = result === 'MATCH'
    return (
      <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2">
        <div
          className={`glass-panel flex items-center gap-3 rounded-full border px-6 py-3 text-lg font-semibold ${
            isMatch
              ? 'border-emerald-400/60 text-emerald-200'
              : 'border-rose-400/60 text-rose-200'
          }`}
        >
          {isMatch ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-8 w-8"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-8 w-8"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span>{isMatch ? '以心伝心！完全一致' : '残念…今回は不一致'}</span>
        </div>
      </div>
    )
  }

  return (
    <NeonBackground>
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-10 text-white sm:px-6 lg:px-10">
        <ResultOverlay />
        {networkError && (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-900/30 px-4 py-3 text-center text-sm text-rose-100">
            通信状態を確認しています…
          </div>
        )}

        <header className="glass-panel rounded-[40px] border-white/10 bg-white/5 px-6 py-6 sm:px-10 sm:py-8">
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-slate-400">Participants</p>
              <h1 className="text-4xl font-black">
                {groomName} & {brideName}
              </h1>
            </div>
            <span className="rounded-full border border-white/15 px-4 py-2 text-sm uppercase tracking-[0.5em] text-slate-200">
              {stageLabel}
            </span>
          </div>
        </header>

        {hasReveal ? (
          <div className="grid flex-1 gap-6 lg:grid-cols-2">
            <div className="glass-panel flex flex-col gap-4 rounded-[42px] border-white/10 bg-white/5 p-6 lg:p-8">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Answer</p>
              <h2 className="text-3xl font-semibold">{groomName}</h2>
              <figure className="flex flex-1 items-center justify-center overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/40">
                <img src={groomImageUrl} alt="groom answer" className="h-full w-full object-contain p-4" />
              </figure>
            </div>
            <div className="glass-panel flex flex-col gap-4 rounded-[42px] border-white/10 bg-white/5 p-6 lg:p-8">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Answer</p>
              <h2 className="text-3xl font-semibold">{brideName}</h2>
              <figure className="flex flex-1 items-center justify-center overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/40">
                <img src={brideImageUrl} alt="bride answer" className="h-full w-full object-contain p-4" />
              </figure>
            </div>
          </div>
        ) : (
          <div className="glass-panel flex flex-1 flex-col items-center justify-center gap-8 rounded-[42px] border-white/10 bg-white/5 p-10 text-center">
            <div>
              <p className="text-sm uppercase tracking-[0.5em] text-slate-300">Now Loading</p>
              <h2 className="mt-2 text-4xl font-black">回答を待機しています</h2>
              <p className="mt-2 text-slate-300">
                両者の回答が揃うと自動で結果が開示されます。しばらくお待ちください。
              </p>
            </div>
            <figure className="w-full max-w-3xl overflow-hidden rounded-[40px] border border-white/10 bg-slate-950/40 flex justify-center">
              <img
                className="object-cover"
                src={config?.standbyScreenUrl ?? '/image/noru.png'}
                alt="standby"
              />
            </figure>
          </div>
        )}
      </div>
      {!enableSoundPlay && (
        <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
          <div className="glass-panel flex items-center gap-4 rounded-full border-white/10 bg-white/10 px-6 py-3 text-sm">
            <span>演出用の効果音を再生しますか？</span>
            <button className="btn border border-white/20 bg-white/10 text-white" onClick={() => setEnableSoundPlay(true)}>
              許可する
            </button>
          </div>
        </div>
      )}
    </NeonBackground>
  )
}

export default IshindenshinBoardPage
