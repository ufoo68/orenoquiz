import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { type NextPage } from 'next'
import { api } from '../../../utils/api'
import type { FC } from 'react'
import { Fragment, useState } from 'react'
import type {
  IshinDenshinSessionState,
  IshinDenshinSessionResult,
} from '@prisma/client'

type Props = {
  sessionId: string
}

const Board: NextPage<Props> = ({ sessionId }) => {
  const [version, setVersion] = useState<number>(1)
  const [state, setState] = useState<IshinDenshinSessionState>('WAIT')
  const [result, setResult] = useState<IshinDenshinSessionResult>('NONE')
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
        if (res.state === 'SHOW') {
          groomAnswer.refetch().catch((e) => console.error(e))
          brideAnswer.refetch().catch((e) => console.error(e))
        }
      },
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )
  const AnswerResult: FC = () => {
    return (
      <div className="absolute w-full">
        <div className="w-full flex justify-center">
          {(() => {
            switch (result) {
              case 'MATCH':
                return (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="green"
                    className="h-80 w-80"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                )
              case 'NOT_MATCH':
                return (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="red"
                    className="h-80 w-80"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )
              case 'NONE':
                return null
            }
          })()}
        </div>
      </div>
    )
  }
  return (
    <div className="grid h-screen w-screen grid-cols-2 grid-rows-3 bg-neutral-200">
      <AnswerResult />
      {groomAnswer.data?.boardImageUrl &&
      brideAnswer.data?.boardImageUrl &&
      state === 'SHOW' ? (
        <Fragment>
          <div className="flex items-center justify-center">
            <div className="rounded-box flex w-80 flex-row items-center justify-center bg-white p-3 text-5xl">
              <div>新郎🤵🏻‍♂️</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="rounded-box flex w-80 flex-row items-center justify-center bg-white p-3 text-5xl">
              <div>新婦👰🏻‍♀️</div>
            </div>
          </div>
          <div className="flex h-full w-full items-center justify-center">
            <img
              className="w-[90%] rounded-xl bg-white"
              src={groomAnswer.data.boardImageUrl}
              alt="groom answer"
            />
          </div>
          <div className="flex h-full w-full items-center justify-center">
            <img
              className="w-[90%] rounded-xl bg-white"
              src={brideAnswer.data.boardImageUrl}
              alt="bride answer"
            />
          </div>
        </Fragment>
      ) : (
        <div className="col-span-2 row-span-3 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="pink"
            className="h-1/3 w-1/3 animate-bounce"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
      )}
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

export default Board
