import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { type NextPage } from 'next'
import { api } from '../../../utils/api'
import type { FC } from 'react'
import { Fragment } from 'react'
import { useState } from 'react'
import type {
  IshinDenshinSessionResult,
  IshinDenshinSessionState,
} from '@prisma/client'

type Props = {
  sessionId: string
}

const Loding: FC = () => {
  return (
    <svg
      aria-hidden="true"
      className="mr-2 h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
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
        fill="currentFill"
      />
    </svg>
  )
}

const Check: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="green"
      className="h-8 w-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}

const Host: NextPage<Props> = ({ sessionId }) => {
  const [groomSubmited, setGroomSubmited] = useState<boolean>(false)
  const [brideSubmited, setBrideSubmited] = useState<boolean>(false)
  const [version, setVersion] = useState<number>(1)
  const [state, setState] = useState<IshinDenshinSessionState>('WAIT')
  const [result, setResult] = useState<IshinDenshinSessionResult>('NONE')
  api.ishindenshin.getSubmited.useQuery(
    {
      sessionId,
      version,
      answereName: 'groom',
    },
    {
      onSuccess: (res) => {
        setGroomSubmited(res.submited)
      },
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )
  api.ishindenshin.getSubmited.useQuery(
    {
      sessionId,
      version,
      answereName: 'bride',
    },
    {
      onSuccess: (res) => {
        setBrideSubmited(res.submited)
      },
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )
  const getStatus = api.ishindenshin.getStatus.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setVersion(res.version)
        setState(res.state)
        setResult(res.result)
      },
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )
  const updateState = api.ishindenshin.updateState.useMutation()
  const handleDisplayAnswer = async () => {
    await updateState.mutateAsync({ sessionId, state: 'SHOW' })
    await getStatus.refetch()
  }
  const handleEvaluateAnswer = async (r: IshinDenshinSessionResult) => {
    await updateState.mutateAsync({ sessionId, result: r })
    await getStatus.refetch()
  }
  const incrementVersion = api.ishindenshin.incrementVersion.useMutation()
  const handleNextVersion = async () => {
    await incrementVersion.mutateAsync({ sessionId })
    await getStatus.refetch()
  }

  const DisplayButton: FC = () => {
    return (
      <button
        className="btn"
        disabled={!groomSubmited || !brideSubmited}
        onClick={() => {
          handleDisplayAnswer().catch((e) => console.error(e))
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15"
          />
        </svg>
      </button>
    )
  }

  const NextButton: FC = () => {
    return (
      <button
        className="btn"
        onClick={() => {
          handleNextVersion().catch((e) => console.error(e))
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z"
          />
        </svg>
      </button>
    )
  }

  const EvaluateButton: FC = () => {
    return (
      <Fragment>
        <button
          className="btn"
          onClick={() => {
            handleEvaluateAnswer('MATCH').catch((e) => console.error(e))
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="green"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          className="btn"
          onClick={() => {
            handleEvaluateAnswer('NOT_MATCH').catch((e) => console.error(e))
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="red"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </Fragment>
    )
  }

  const ActionButton: FC = () => {
    if (state === 'WAIT') {
      return <DisplayButton />
    } else if (state === 'SHOW' && result === 'NONE') {
      return <EvaluateButton />
    }
    return <NextButton />
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-20 bg-base-300">
      <div className="tooltip" data-tip={groomSubmited ? '回答済み' : '回答中'}>
        <div className="card rounded-box flex h-20 w-80 flex-row items-center justify-center space-x-10 bg-white text-3xl">
          <div>新郎🤵🏻‍♂️</div>
          {groomSubmited ? <Check /> : <Loding />}
        </div>
      </div>
      <div className="tooltip" data-tip={brideSubmited ? '回答済み' : '回答中'}>
        <div className="card rounded-box flex h-20 w-80 flex-row items-center justify-center space-x-10 bg-white text-3xl">
          <div>新婦👰🏻‍♀️</div>
          {brideSubmited ? <Check /> : <Loding />}
        </div>
      </div>
      <div className="flex space-x-10">
        <ActionButton />
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

export default Host
