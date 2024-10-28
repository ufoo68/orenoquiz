import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { api } from '../../../utils/api'

type Props = {
  sessionId: string
}

const IshindenshinResult = ({ sessionId }: Props) => {
  const { data: answerData = [] } = api.ishindenshin.getAllAnswer.useQuery({
    sessionId,
  })
  const groomData = answerData.filter((data) => data.answereName === 'groom')
  const brideData = answerData.filter((data) => data.answereName === 'bride')
  const { data: config } = api.ishindenshin.getConfig.useQuery({ sessionId })
  return (
    <div className="h-screen w-screen bg-neutral-200 flex items-center justify-center">
      <div className="card flex w-10/12 flex-col bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center text-2xl">結果発表</div>
          <div className="max-h-[80vh] overflow-y-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-center text-xl">
                    {config?.participants?.groomName}
                  </th>
                  <th className="text-center text-xl">
                    {config?.participants?.brideName}
                  </th>
                </tr>
              </thead>
              <tbody className="text-2xl">
                {groomData
                  .map((groom) => {
                    const bride = brideData.find(
                      (b) => b.version === groom.version
                    )
                    return {
                      id: groom.id,
                      groomBoard: groom.boardImageUrl,
                      brideBoard: bride?.boardImageUrl ?? '',
                    }
                  })
                  .map((data) => (
                    <tr key={data.id}>
                      <td>
                        <img
                          src={data.groomBoard}
                          alt="groom"
                          className="w-full rounded-xl bg-white"
                        />
                      </td>
                      <td>
                        <img
                          src={data.brideBoard}
                          alt="bride"
                          className="w-full rounded-xl bg-white"
                        />
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

export const getServerSideProps = (
  context: GetServerSidePropsContext
): GetServerSidePropsResult<Props> => {
  const { id } = context.query
  if (typeof id !== 'string') {
    return { notFound: true }
  }
  return { props: { sessionId: id } }
}

export default IshindenshinResult
