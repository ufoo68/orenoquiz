'use client'

import type { FC } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { IshinDenshinSessionState } from '@prisma/client'

import { api } from '../../../../../utils/api'
import SignaturePad, {
  type SignaturePadHandle,
} from '../../../../../components/common/SignaturePad'
import { NeonBackground } from '../../../../../components/common/NeonBackground'

type AnswereClientProps = {
  sessionId: string
  answereName: 'groom' | 'bride'
}

export const AnswereClient = ({
  sessionId,
  answereName,
}: AnswereClientProps) => {
  const padRef = useRef<SignaturePadHandle>(null)
  const [version, setVersion] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [state, setState] = useState<IshinDenshinSessionState>('WAIT')
  const [networkError, setNetworkError] = useState(false)
  const [sending, setSending] = useState(false)
  const disabled = submitted || state === 'SHOW'

  const getSubmitted = api.ishindenshin.getSubmited.useQuery(
    { sessionId, answereName, version },
    {
      onSuccess: (res) => {
        setSubmitted(res.submited)
      },
    }
  )

  const getStatus = api.ishindenshin.getStatus.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setVersion(res.version)
        setState(res.state)
        if (res.state === 'WAIT') {
          getSubmitted.refetch().catch((error) => console.error(error))
        }
        setNetworkError(false)
      },
      onError: () => {
        setNetworkError(true)
      },
      refetchInterval: 1000,
    }
  )

  const submitAnswer = api.ishindenshin.submitAnswer.useMutation()
  const { data: config } = api.ishindenshin.getConfig.useQuery({ sessionId })

  useEffect(() => {
    if (state === 'WAIT') {
      padRef.current?.clear()
    }
  }, [state])

  const handleSubmitAnswer = async () => {
    const isOk = window.confirm('回答を送信しますか？')
    if (!isOk) {
      return
    }
    setSending(true)
    const boardImageUrl = padRef.current?.toDataURL() ?? ''
    await submitAnswer.mutateAsync({
      sessionId,
      version,
      answereName,
      boardImageUrl,
    })
    await getStatus.refetch()
    setSending(false)
  }

  const nameKey = (answereName + 'Name') as 'groomName' | 'brideName'
  const playerName = config?.participants?.[nameKey] ?? (answereName === 'groom' ? '新郎' : '新婦')

  const stageLabel = useMemo(() => {
    if (state === 'SHOW') return '結果公開中'
    if (state === 'END') return '終了'
    return submitted ? '送信済み' : '回答中'
  }, [state, submitted])

  return (
    <NeonBackground>
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-5 px-4 py-6 text-white sm:gap-6 sm:py-10">
        {networkError && (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            通信が不安定です。電波状況を確認してください。
          </div>
        )}

        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.6em] text-slate-400">Ishin Denshin Player</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{playerName}</h1>
          <p className="mt-2 text-sm text-slate-300">
            お題に沿ってホワイトボードに描いてください。送信後は司会者の合図を待ちましょう。
          </p>
        </header>

        <section className="glass-panel rounded-[32px] border-white/10 bg-white/5 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/15 px-3 py-1">ver.{version}</span>
              <span className="rounded-full border border-white/15 px-3 py-1">{stageLabel}</span>
            </div>
            {submitted && (
              <span className="text-xs text-emerald-200">送信済み。次の指示を待ってください。</span>
            )}
          </div>

          <div className="mt-4 rounded-[28px] border border-white/10 bg-white/90 p-3 shadow-inner">
            <div className="h-[360px] w-full sm:h-[420px]">
              <SignaturePad
                ref={padRef}
                penColor="rgb(15,23,42)"
                backgroundColor="#ffffff"
                className={`h-full w-full rounded-[24px] ${disabled ? 'pointer-events-none opacity-70' : 'pointer-events-auto'}`}
                disabled={disabled}
              />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            ※ ペンの太さは指で描きやすい幅に調整されています
          </p>
        </section>

        <section className="glass-panel rounded-[28px] border-white/10 bg-white/5 p-5 text-sm text-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.4em] text-slate-400">
            <span>Controls</span>
            <span>{disabled ? '操作不可' : '入力受付中'}</span>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-base text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-500"
              onClick={() => padRef.current?.clear()}
              disabled={disabled}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </svg>
              やり直す
            </button>
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-300/60 bg-amber-400/10 px-5 py-4 text-base text-amber-100 transition hover:border-amber-200 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-500"
              onClick={() => {
                handleSubmitAnswer().catch((error) => console.error(error))
              }}
              disabled={disabled}
            >
              {sending && <LoadingSpinner />}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
              送信する
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            送信すると取り消せません。内容を確認のうえで送信してください。
          </p>
        </section>
      </div>
    </NeonBackground>
  )
}

const LoadingSpinner: FC = () => {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 animate-spin text-amber-200"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="#fde68a"
      />
    </svg>
  )
}

export default AnswereClient
