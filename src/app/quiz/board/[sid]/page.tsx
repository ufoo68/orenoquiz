'use client'

import { useMemo, useState } from 'react'
import { useQRCode } from 'next-qrcode'

import { NeonBackground } from '../../../../components/common/NeonBackground'
import { EndCard } from '../../../../components/common/EndCard'
import type { QuizSessionState } from '../../../../types/quizSession'
import { getQuizSessionStateEntry } from '../../../../types/quizSession'
import { api } from '../../../../utils/api'
import { QuestionContents, SortTypeQuestion } from '../../../../types/question'

type PageProps = {
  params: {
    sid: string
  }
}

const QuizBoardPage = ({ params }: PageProps) => {
  const { sid: sessionId } = params
  const [state, setState] = useState<QuizSessionState>(
    getQuizSessionStateEntry()
  )
  const [networkError, setNetworkError] = useState(false)
  const { Canvas } = useQRCode()

  const stateQuery = api.quizSession.getState.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        if (res) {
          setState(res)
        }
        setNetworkError(false)
      },
      onError: () => {
        setNetworkError(true)
      },
      refetchInterval: 1000,
    }
  )

  const participantsQuery = api.quizParticipant.getAllCount.useQuery(
    { sessionId },
    {
      enabled: state.type !== 'end',
      refetchInterval: 1000,
    }
  )

  const { data: questionData } = api.quizQuestion.get.useQuery(
    {
      questionId:
        state.type === 'question' || state.type === 'answer'
          ? state.questionId
          : '',
    },
    {
      enabled: state.type === 'question' || state.type === 'answer',
    }
  )

  const submitCountQuery = api.quizParticipant.getSubmitCount.useQuery(
    { sessionId, questionId: state.type === 'question' ? state.questionId : '' },
    {
      enabled: state.type === 'question',
      refetchInterval: 1000,
    }
  )

  const winCountQuery = api.quizParticipant.getQuestionWinCount.useQuery(
          { sessionId, questionId: state.type === 'answer' ? state.questionId : '' },
          {
      enabled: state.type === 'answer',
    }
  )

  const totalScoreQuery = api.quizSession.getTotalScore.useQuery(
    { sessionId },
    {
      enabled: state.type === 'rank',
    }
  )

  const stageLabel = useMemo(() => {
    switch (state.type) {
      case 'entry':
        return 'ENTRY'
      case 'question':
        return 'QUESTION'
      case 'answer':
        return 'ANSWER'
      case 'rank':
        return 'RANKING'
      case 'end':
        return 'FINALE'
      default:
        return 'SESSION'
    }
  }, [state.type])

  const renderEntry = () => {
    return (
      <div className="glass-panel flex h-full w-full flex-col items-center justify-center gap-10 px-6 py-10 text-center text-white">
        <div>
          <p className="text-sm uppercase tracking-[0.8em] text-slate-300">
            Now Serving
          </p>
          <h2 className="mt-4 text-5xl font-black">参加者を受付中</h2>
          <p className="mt-2 text-lg text-slate-200">
            QRコードを読み取って参加してください
          </p>
        </div>
        <div className="rounded-[32px] border border-white/15 bg-white/10 p-8">
          <Canvas
            text={`https://orenoquiz.vercel.app/quiz/participant/${sessionId}`}
            options={{
              scale: 12,
            }}
          />
        </div>
        <div className="text-3xl text-amber-300">
          参加者 {participantsQuery.data ?? 0} 名
        </div>
      </div>
    )
  }

  const renderQuestion = () => {
    if (!questionData) {
      return <LoadingPanel />
    }
    const contents = questionData.contents as SortTypeQuestion
    return (
      <div className="flex h-full flex-col gap-8">
        <div className="glass-panel space-y-4 p-10 text-white">
          <p className="text-sm uppercase tracking-[0.5em] text-slate-300">
            QUESTION {questionData.order}
          </p>
          <h2 className="text-5xl font-black">{questionData.title}</h2>
          {contents.thumbnailUrl ? (
            <figure className="w-full max-w-lg overflow-hidden rounded-[32px] border border-white/20">
              <img
                src={contents.thumbnailUrl}
                alt="thumbnail"
                className="h-full w-full object-cover"
              />
            </figure>
          ) : null}
          <p className="text-lg text-slate-200">回答端末で選択してください</p>
        </div>
        <div className="grid gap-4 text-3xl text-white md:grid-cols-2">
          {contents.questions.map((q, index) => (
            <div
              key={q.id}
              className="glass-panel flex items-center gap-4 px-6 py-5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl font-bold">
                {contents.type === 'sort'
                  ? q.order
                  : String.fromCharCode(65 + index)}
              </div>
              <div className="flex-1">{q.label}</div>
            </div>
          ))}
        </div>
        <div className="glass-panel flex items-center justify-between px-8 py-6 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              回答状況
            </p>
            <p className="text-4xl font-black text-amber-300">
              {submitCountQuery.data ?? 0}/{participantsQuery.data ?? 0}
            </p>
          </div>
          <progress
            className="progress progress-primary h-4 w-1/2"
            value={submitCountQuery.data ?? 0}
            max={participantsQuery.data ?? 1}
          ></progress>
        </div>
      </div>
    )
  }

  const renderAnswer = () => {
    if (!questionData) return <LoadingPanel />
    const contents = questionData.contents as QuestionContents
    return (
      <div className="glass-panel space-y-6 p-10 text-white">
        <p className="text-sm uppercase tracking-[0.5em] text-slate-400">
          Answer Reveal
        </p>
        <h2 className="text-4xl font-bold">{questionData.title}</h2>
        {contents.thumbnailUrl ? (
          <figure className="w-full max-w-lg overflow-hidden rounded-[32px] border border-white/20">
            <img
              src={contents.thumbnailUrl}
              alt="thumbnail"
              className="h-full w-full object-cover"
            />
          </figure>
        ) : null}
        {contents.type === 'select' ? (
          <div className="grid gap-4 text-3xl md:grid-cols-2">
            {contents.questions.map((q, index) => {
              const correct = q.id === contents.answerId
              return (
                <div
                  key={q.id}
                  className={`rounded-3xl border px-6 py-5 ${
                    correct
                      ? 'border-emerald-400 bg-emerald-400/20 text-emerald-100'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{q.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <ol className="space-y-3 text-3xl">
            {contents.questions
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((q) => (
                <li
                  key={q.id}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3"
                >
                  {q.order}. {q.label}
                </li>
              ))}
          </ol>
        )}
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-3xl">
          正解者：{winCountQuery.data ?? 0} / {participantsQuery.data ?? 0}
        </div>
      </div>
    )
  }

  const renderRank = () => {
    const ranks = totalScoreQuery.data ?? []
    return (
      <div className="glass-panel space-y-6 p-10 text-white">
        <p className="text-sm uppercase tracking-[0.5em] text-slate-400">
          Ranking
        </p>
        <h2 className="text-4xl font-bold">結果発表</h2>
        <div className="max-h-[60vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/70 p-5">
          <div className="grid grid-cols-3 text-xs uppercase tracking-[0.3em] text-slate-300">
            <span>順位</span>
            <span>名前</span>
            <span className="text-right">正解数</span>
          </div>
          <div className="mt-4 space-y-3 text-2xl">
            {ranks.map((rank) => (
              <div
                key={rank.id}
                className="grid grid-cols-3 items-center rounded-2xl bg-white/5 px-4 py-3 text-white"
              >
                <span className="font-black text-amber-300">{rank.rank}</span>
                <span>{rank.name}</span>
                <span className="text-right font-semibold">{rank.winCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderStage = () => {
    switch (state.type) {
      case 'entry':
        return renderEntry()
      case 'question':
        return renderQuestion()
      case 'answer':
        return renderAnswer()
      case 'rank':
        return renderRank()
      case 'end':
        return <EndCard />
      default:
        return <LoadingPanel />
    }
  }

  return (
    <NeonBackground>
      {networkError && (
        <div className="alert alert-error fixed left-1/2 top-5 z-40 w-[90vw] max-w-xl -translate-x-1/2 bg-rose-600/90 text-white shadow-lg shadow-rose-500/40">
          <span>ネットワークに接続できません。通信を確認してください。</span>
        </div>
      )}
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col items-center text-center text-white">
          <p className="text-xs uppercase tracking-[0.7em] text-slate-300">
            Oreno Quiz Board
          </p>
          <span className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-2 text-sm uppercase tracking-[0.4em] text-amber-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            {stageLabel}
          </span>
        </header>
        <div className="flex-1">{renderStage()}</div>
      </div>
    </NeonBackground>
  )
}

const LoadingPanel = () => (
  <div className="glass-panel flex h-full w-full items-center justify-center p-10 text-white">
    <progress className="progress progress-primary w-1/2" />
  </div>
)

export default QuizBoardPage
