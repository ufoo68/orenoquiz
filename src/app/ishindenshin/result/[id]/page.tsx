'use client'

import { NeonBackground } from '../../../../components/common/NeonBackground'
import { api } from '../../../../utils/api'

type PageProps = {
  params: {
    id: string
  }
}

const IshindenshinResultPage = ({ params }: PageProps) => {
  const { id: sessionId } = params
  const { data: answerData = [] } = api.ishindenshin.getAllAnswer.useQuery({ sessionId })
  const { data: config } = api.ishindenshin.getConfig.useQuery({ sessionId })

  const groomName = config?.participants?.groomName ?? '一人目'
  const brideName = config?.participants?.brideName ?? '二人目'

  const groomData = answerData.filter((data) => data.answereName === 'groom')
  const brideData = answerData.filter((data) => data.answereName === 'bride')

  const pairedAnswers = groomData
    .map((groom) => {
      const bride = brideData.find((data) => data.version === groom.version)
      return {
        id: groom.id,
        version: groom.version,
        groomBoard: groom.boardImageUrl ?? '',
        brideBoard: bride?.boardImageUrl ?? '',
      }
    })
    .sort((a, b) => a.version - b.version)

  return (
    <NeonBackground>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-10 text-white sm:px-6 lg:px-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-slate-400">Final Gallery</p>
            <h1 className="text-3xl font-black">以心伝心ゲームの作品集</h1>
            <p className="text-sm text-slate-300">セッションID：{sessionId}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-200">
            <span className="rounded-full border border-white/20 px-4 py-1">
              {groomName}
            </span>
            <span className="rounded-full border border-white/20 px-4 py-1">
              {brideName}
            </span>
            <span className="rounded-full border border-amber-300/40 px-4 py-1 text-amber-200">
              全{pairedAnswers.length}ラウンド
            </span>
          </div>
        </header>

        <section className="glass-panel flex-1 overflow-hidden rounded-[40px] border-white/10 bg-white/5">
          {pairedAnswers.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-slate-300">
              まだ結果がありません。ゲームを進行するとここに表示されます。
            </div>
          ) : (
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
              {pairedAnswers.map((data) => (
                <article
                  key={data.id}
                  className="rounded-[32px] border border-white/10 bg-slate-950/30 p-4 shadow-inner sm:p-6"
                >
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span className="uppercase tracking-[0.5em] text-slate-400">Round</span>
                    <span className="text-xl font-semibold text-amber-200">#{data.version}</span>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300">{groomName}</p>
                      <figure className="flex h-full min-h-[220px] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/50">
                        {data.groomBoard ? (
                          <img
                            src={data.groomBoard}
                            alt={`${groomName} round ${data.version}`}
                            className="h-full w-full object-contain p-4"
                          />
                        ) : (
                          <span className="text-sm text-slate-500">記録がありません</span>
                        )}
                      </figure>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300">{brideName}</p>
                      <figure className="flex h-full min-h-[220px] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/50">
                        {data.brideBoard ? (
                          <img
                            src={data.brideBoard}
                            alt={`${brideName} round ${data.version}`}
                            className="h-full w-full object-contain p-4"
                          />
                        ) : (
                          <span className="text-sm text-slate-500">記録がありません</span>
                        )}
                      </figure>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </NeonBackground>
  )
}

export default IshindenshinResultPage
