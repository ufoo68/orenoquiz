'use client'

import { api } from '../../../../utils/api'

type PageProps = {
  params: {
    id: string
  }
}

const IshindenshinResultPage = ({ params }: PageProps) => {
  const { id: sessionId } = params
  const { data: answerData = [] } = api.ishindenshin.getAllAnswer.useQuery({ sessionId })
  const groomData = answerData.filter((data) => data.answereName === 'groom')
  const brideData = answerData.filter((data) => data.answereName === 'bride')
  const { data: config } = api.ishindenshin.getConfig.useQuery({ sessionId })

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-neutral-200 p-4">
      <div className="card flex w-full max-w-6xl flex-col bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center text-2xl">結果発表</div>
          <div className="max-h-[80vh] overflow-y-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-center text-xl">{config?.participants?.groomName}</th>
                  <th className="text-center text-xl">{config?.participants?.brideName}</th>
                </tr>
              </thead>
              <tbody className="text-2xl">
                {groomData
                  .map((groom) => {
                    const bride = brideData.find((data) => data.version === groom.version)
                    return {
                      id: groom.id,
                      groomBoard: groom.boardImageUrl,
                      brideBoard: bride?.boardImageUrl ?? '',
                    }
                  })
                  .map((data) => (
                    <tr key={data.id}>
                      <td>
                        <img src={data.groomBoard} alt="groom" className="w-full rounded-xl bg-white" />
                      </td>
                      <td>
                        <img src={data.brideBoard} alt="bride" className="w-full rounded-xl bg-white" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IshindenshinResultPage
