import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { type NextPage } from 'next'
import { api } from '../../../utils/api'
import type { FC} from 'react';
import { useEffect } from 'react'
import { Fragment, useState } from 'react'
import type {
  IshinDenshinSessionState,
  IshinDenshinSessionResult,
} from '@prisma/client'
import useSound from 'use-sound'

type Props = {
  sessionId: string
}

const Board: NextPage<Props> = ({ sessionId }) => {
  const [enableAutoPlay, setEnableAutoPlay] = useState<boolean>(false)
  const [version, setVersion] = useState<number>(1)
  const [state, setState] = useState<IshinDenshinSessionState>('WAIT')
  const [result, setResult] = useState<IshinDenshinSessionResult>('NONE')
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
          groomAnswer.refetch().catch((e) => console.error(e))
          brideAnswer.refetch().catch((e) => console.error(e))
        }
      },
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )
  useEffect(() => {
    if (enableAutoPlay && state === 'SHOW' && result === 'NONE') {
      playSoundShow()
    } else if (enableAutoPlay && state === 'SHOW' && result === 'MATCH') {
      playSoundCorrect()
    } else if (enableAutoPlay && state === 'SHOW' && result === 'NOT_MATCH') {
      playSoundIncorrect()
    }
  }, [state, enableAutoPlay, result])
  const AnswerResult: FC = () => {
    return (
      <div className="absolute w-full">
        <div className="flex w-full justify-center">
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
        <div className="col-span-2 row-span-3 flex items-end justify-center">
          <img
            className="mb-20 h-2/3 animate-bounce"
            src="/image/noru.png"
            alt="noru"
          />
        </div>
      )}
      <div
        className={`absolute bottom-0 h-20 w-full flex justify-center items-center ${
          enableAutoPlay ? 'hidden' : ''
        }`}
      >
        <button className="btn" onClick={() => setEnableAutoPlay(true)}>
          効果音の自動再生を許可
        </button>
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

export default Board
