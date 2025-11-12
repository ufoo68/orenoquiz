import Link from 'next/link'

import { Container } from '../../../../components/quizHost/Container'
import { NeonBackground } from '../../../../components/common/NeonBackground'

type PageProps = {
  params: {
    sid: string
  }
}

const QuizHostPage = ({ params }: PageProps) => {
  const { sid: sessionId } = params

  return (
    <NeonBackground>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-slate-300/70">Host Console</p>
            <p className="text-sm text-slate-300">司会者用の操作画面です。音量とネットワークをご確認ください。</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-200">
            <Link
              className="btn border-white/20 bg-white/5 text-white backdrop-blur"
              href={`/quiz/participant/${sessionId}?pid=demo`}
              target="_blank"
            >
              参加者画面を新規タブで開く
            </Link>
          </div>
        </header>

        <div className="grid flex-1 gap-8 lg:grid-cols-[1.7fr_0.9fr]">
          <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
            <Container sessionId={sessionId} />
          </div>
          <div className="flex flex-col gap-6">
            <div className="glass-panel flex-1 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-sm text-slate-200/90">
                <span>参加者プレビュー</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em]">LIVE</span>
              </div>
              <div className="relative overflow-hidden p-3">
                <iframe
                  className="h-[520px] w-full rounded-2xl border border-white/10 bg-slate-900/30"
                  src={`/quiz/participant/${sessionId}?pid=demo`}
                  title="participant-preview"
                />
              </div>
            </div>
            <div className="glass-panel px-6 py-5 text-sm text-slate-200">
              <p className="font-semibold text-white">運営メモ</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                <li>下部のボタンから音声演出の許可を促せます。</li>
                <li>参加者プレビューはデモユーザーです。実際の端末で動作確認してください。</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </NeonBackground>
  )
}

export default QuizHostPage
