'use client'

import { Fragment, useMemo, useState } from 'react'
import type {
  IshinDenshinSessionResult,
  IshinDenshinSessionState,
} from '@prisma/client'

import { NeonBackground } from '../../../../components/common/NeonBackground'
import { api } from '../../../../utils/api'

type PageProps = {
  params: {
    id: string
  }
}

const Spinner = () => (
  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-amber-300" />
)

const CheckBadge = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-6 w-6 text-emerald-300"
  >
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IshindenshinHostPage = ({ params }: PageProps) => {
  const { id: sessionId } = params
  const [groomSubmitted, setGroomSubmitted] = useState(false)
  const [brideSubmitted, setBrideSubmitted] = useState(false)
  const [version, setVersion] = useState(1)
  const [state, setState] = useState<IshinDenshinSessionState>('WAIT')
  const [result, setResult] = useState<IshinDenshinSessionResult>('NONE')
  const [networkError, setNetworkError] = useState(false)
  const [sending, setSending] = useState(false)

  api.ishindenshin.getSubmited.useQuery(
    { sessionId, version, answereName: 'groom' },
    {
      onSuccess: (res) => {
        setGroomSubmitted(res.submited)
        setNetworkError(false)
      },
      onError: () => setNetworkError(true),
      refetchInterval: 1000,
    }
  )

  api.ishindenshin.getSubmited.useQuery(
    { sessionId, version, answereName: 'bride' },
    {
      onSuccess: (res) => {
        setBrideSubmitted(res.submited)
        setNetworkError(false)
      },
      onError: () => setNetworkError(true),
      refetchInterval: 1000,
    }
  )

  const getStatus = api.ishindenshin.getStatus.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setVersion(res.version)
        setState(res.state)
        setResult(res.result)
        setNetworkError(false)
      },
      onError: () => setNetworkError(true),
      refetchInterval: 1000,
    }
  )

  const { data: config } = api.ishindenshin.getConfig.useQuery({ sessionId })
  const updateState = api.ishindenshin.updateState.useMutation()
  const incrementVersion = api.ishindenshin.incrementVersion.useMutation()

  const handleDisplayAnswer = async () => {
    setSending(true)
    await updateState.mutateAsync({ sessionId, state: 'SHOW' })
    await getStatus.refetch()
    setSending(false)
  }

  const handleEvaluateAnswer = async (value: IshinDenshinSessionResult) => {
    setSending(true)
    await updateState.mutateAsync({ sessionId, result: value })
    await getStatus.refetch()
    setSending(false)
  }

  const handleNextVersion = async () => {
    setSending(true)
    await incrementVersion.mutateAsync({ sessionId })
    await getStatus.refetch()
    setSending(false)
  }

  const handleGameEnd = async () => {
    if (!window.confirm('終了しますか？')) return
    setSending(true)
    await updateState.mutateAsync({ sessionId, state: 'END' })
    await getStatus.refetch()
    setSending(false)
  }

  const handleGameRestart = async () => {
    setSending(true)
    await updateState.mutateAsync({ sessionId, state: 'WAIT', result: 'NONE' })
    await getStatus.refetch()
    setSending(false)
  }

  const stageLabel = useMemo(() => {
    switch (state) {
      case 'WAIT':
        return '回答待ち'
      case 'SHOW':
        return '回答公開中'
      case 'END':
        return '終了'
      default:
        return ''
    }
  }, [state])

  const stageDescription = useMemo(() => {
    if (state === 'END') return 'ゲームを終了しました。再開するには下のボタンを押してください。'
    if (state === 'SHOW' && result === 'NONE') return '回答を公開中です。結果を判定してください。'
    if (state === 'SHOW' && result !== 'NONE') return '判定が完了しました。次の問題に進めます。'
    return '両者の回答が揃ったら「回答を表示」を押してください。'
  }, [result, state])

  const renderActionButtons = () => {
    if (state === 'WAIT') {
      return (
        <button
          className="btn flex w-full items-center justify-center gap-2 border border-white/20 bg-white/10 text-white disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-400 sm:w-auto"
          disabled={!groomSubmitted || !brideSubmitted || sending}
          onClick={() => {
            handleDisplayAnswer().catch((error) => console.error(error))
          }}
        >
          {sending && <Spinner />}
          <span>回答を表示</span>
        </button>
      )
    }

    if (state === 'SHOW' && result === 'NONE') {
      return (
        <Fragment>
          <button
            className="btn flex w-full items-center justify-center gap-2 border border-emerald-400/60 bg-emerald-500/10 text-emerald-100 sm:w-auto"
            disabled={sending}
            onClick={() => {
              handleEvaluateAnswer('MATCH').catch((error) => console.error(error))
            }}
          >
            {sending && <Spinner />}
            <span>一致！</span>
          </button>
          <button
            className="btn flex w-full items-center justify-center gap-2 border border-rose-400/60 bg-rose-500/10 text-rose-100 sm:w-auto"
            disabled={sending}
            onClick={() => {
              handleEvaluateAnswer('NOT_MATCH').catch((error) => console.error(error))
            }}
          >
            {sending && <Spinner />}
            <span>不一致</span>
          </button>
        </Fragment>
      )
    }

    if (state === 'END') {
      return (
        <button
          className="btn flex w-full items-center justify-center gap-2 border border-white/20 bg-white/10 text-white sm:w-auto"
          disabled={sending}
          onClick={() => {
            handleGameRestart().catch((error) => console.error(error))
          }}
        >
          {sending && <Spinner />}
          <span>再開する</span>
        </button>
      )
    }

    return (
      <button
        className="btn flex w-full items-center justify-center gap-2 border border-amber-300/70 bg-amber-400/10 text-amber-100 sm:w-auto"
        disabled={sending}
        onClick={() => {
          handleNextVersion().catch((error) => console.error(error))
        }}
      >
        {sending && <Spinner />}
        <span>次の問題へ</span>
      </button>
    )
  }

  const actionControls = renderActionButtons()

  return (
    <NeonBackground>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 pb-32 pt-6 text-white sm:gap-6 sm:px-6 sm:pt-8 lg:px-10 lg:pb-12">
        {networkError && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            通信が不安定です。ネットワークをご確認ください。
          </div>
        )}

        <header className="glass-panel rounded-[40px] border-white/10 bg-white/5 px-6 py-6 sm:px-10 sm:py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-300">
              <p className="uppercase tracking-[0.4em] text-slate-400">状態：{stageLabel}</p>
              <p className="mt-1">{stageDescription}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 grid-rows-2">
          <div className="glass-panel rounded-[32px] border-white/10 bg-white/5 p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Player</p>
            <div className="mt-3 text-xl font-bold">{config?.participants?.groomName ?? '一人目'}</div>
            <p className="mt-1 text-sm text-slate-300">タブレットまたはスマホで描画中</p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
              {groomSubmitted ? <CheckBadge /> : <Spinner />}
              <div className="text-sm text-slate-200">
                {groomSubmitted ? '回答が届きました' : '入力待ち'}
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] border-white/10 bg-white/5 p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Player</p>
            <div className="mt-3 text-xl font-bold">{config?.participants?.brideName ?? '二人目'}</div>
            <p className="mt-1 text-sm text-slate-300">タブレットまたはスマホで描画中</p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
              {brideSubmitted ? <CheckBadge /> : <Spinner />}
              <div className="text-sm text-slate-200">
                {brideSubmitted ? '回答が届きました' : '入力待ち'}
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="">
        <div className="fixed bottom-4 left-1/2 z-30 w-[min(520px,calc(100%-2rem))] -translate-x-1/2 rounded-3xl border border-white/15 bg-slate-950/80 p-4 shadow-2xl backdrop-blur">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">操作</p>
          <div className="mt-3 flex flex-wrap gap-3">{actionControls}</div>
          <button
            className="btn mt-3 flex w-full items-center justify-center gap-2 border border-white/15 bg-transparent text-white"
            disabled={sending}
            onClick={() => {
              handleGameEnd().catch((error) => console.error(error))
            }}
          >
            {sending && <Spinner />}
            <span>終了する</span>
          </button>
        </div>
      </div>
    </NeonBackground>
  )
}

export default IshindenshinHostPage
