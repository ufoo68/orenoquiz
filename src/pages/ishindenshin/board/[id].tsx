import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { type NextPage } from 'next'
import { api } from '../../../utils/api'
import type { FC } from 'react'
import { use, useEffect } from 'react'
import { Fragment, useState } from 'react'
import type {
  IshinDenshinSessionState,
  IshinDenshinSessionResult,
} from '@prisma/client'
import useSound from 'use-sound'
import { useRouter } from 'next/navigation'

type Props = {
  sessionId: string
}

const Board: NextPage<Props> = ({ sessionId }) => {
  const [enableSoundPlay, setEnableSoundPlay] = useState<boolean>(false)
  const [version, setVersion] = useState<number>(1)
  const [state, setState] = useState<IshinDenshinSessionState>('WAIT')
  const [result, setResult] = useState<IshinDenshinSessionResult>('NONE')
  const [playSoundShow] = useSound('/sound/show.mp3')
  const [playSoundCorrect] = useSound('/sound/correct.mp3')
  const [playSoundIncorrect] = useSound('/sound/incorrect.mp3')
  const [networkError, setNetworkError] = useState<boolean>(false)
  const router = useRouter()
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
        setNetworkError(false)
      },
      onError: (e) => {
        console.error(e)
        setNetworkError(true)
      },
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )
  const { data: config} = api.ishindenshin.getConfig.useQuery(
    { sessionId }
  )
  useEffect(() => {
    if (enableSoundPlay && state === 'SHOW' && result === 'NONE') {
      playSoundShow()
    } else if (enableSoundPlay && state === 'SHOW' && result === 'MATCH') {
      playSoundCorrect()
    } else if (enableSoundPlay && state === 'SHOW' && result === 'NOT_MATCH') {
      playSoundIncorrect()
    }
  }, [state, enableSoundPlay, result])
  useEffect(() => {
    if (state === 'END') {
      router.push(`/ishindenshin/result/${sessionId}`)
    }
  }, [state])
  const AnswerResult: FC = () => {
    return (
      <div className="absolute w-full">
        {networkError && (
          <div role="alert" className="alert alert-error fixed top-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>インターネットが接続されていません</span>
          </div>
        )}
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
            <div className="flex w-80 flex-row items-center justify-center text-5xl">
              <div>{config?.participants?.groomName}</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex w-80 flex-row items-center justify-center text-5xl">
              <div>{config?.participants?.brideName}</div>
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
            src={config?.standbyScreenUrl ?? '/images/noru.png'}
            alt="noru"
          />
        </div>
      )}
      <div
        className={`absolute bottom-0 flex h-20 w-full items-center justify-center ${
          enableSoundPlay ? 'hidden' : ''
        }`}
      >
        <button className="btn" onClick={() => setEnableSoundPlay(true)}>
          効果音の再生を許可
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
