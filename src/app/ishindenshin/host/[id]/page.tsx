'use client'

import type { FC } from 'react'
import { Fragment, useState } from 'react'
import type { IshinDenshinSessionResult, IshinDenshinSessionState } from '@prisma/client'

import { api } from '../../../../utils/api'

type PageProps = {
  params: {
    id: string
  }
}

const LoadingIcon: FC = () => {
  return (
    <svg
      aria-hidden="true"
      className="mr-2 h-8 w-8 animate-spin fill-blue-600 text-gray-200"
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

const CheckIcon: FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="green" className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

const IshindenshinHostPage = ({ params }: PageProps) => {
  const { id: sessionId } = params
  const [groomSubmitted, setGroomSubmitted] = useState(false)
  const [brideSubmitted, setBrideSubmitted] = useState(false)
  const [version, setVersion] = useState(1)
  const [state, setState] = useState<IshinDenshinSessionState>('WAIT')
  const [result, setResult] = useState<IshinDenshinSessionResult>('NONE')
  const [networkError, setNetworkError] = useState(false)
  const [sending, setSending] = useState(false)

  api.ishindenshin.getSubmited.useQuery(
    { sessionId, version, answereName: 'groom' },
    {
      onSuccess: (res) => {
        setGroomSubmitted(res.submited)
        setNetworkError(false)
      },
      onError: () => setNetworkError(true),
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )

  api.ishindenshin.getSubmited.useQuery(
    { sessionId, version, answereName: 'bride' },
    {
      onSuccess: (res) => {
        setBrideSubmitted(res.submited)
        setNetworkError(false)
      },
      onError: () => setNetworkError(true),
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
        setNetworkError(false)
      },
      onError: () => setNetworkError(true),
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )

  const { data: config } = api.ishindenshin.getConfig.useQuery({ sessionId })
  const updateState = api.ishindenshin.updateState.useMutation()
  const incrementVersion = api.ishindenshin.incrementVersion.useMutation()

  const handleDisplayAnswer = async () => {
    setSending(true)
    await updateState.mutateAsync({ sessionId, state: 'SHOW' })
    await getStatus.refetch()
    setSending(false)
  }

  const handleEvaluateAnswer = async (value: IshinDenshinSessionResult) => {
    setSending(true)
    await updateState.mutateAsync({ sessionId, result: value })
    await getStatus.refetch()
    setSending(false)
  }

  const handleNextVersion = async () => {
    setSending(true)
    await incrementVersion.mutateAsync({ sessionId })
    await getStatus.refetch()
    setSending(false)
  }

  const handleGameEnd = async () => {
    if (!window.confirm('終了しますか？')) return
    setSending(true)
    await updateState.mutateAsync({ sessionId, state: 'END' })
    await getStatus.refetch()
    setSending(false)
  }

  const handleGameRestart = async () => {
    setSending(true)
    await updateState.mutateAsync({ sessionId, state: 'WAIT', result: 'NONE' })
    await getStatus.refetch()
    setSending(false)
  }

  const DisplayButton: FC = () => (
    <button
      className="btn"
      disabled={!groomSubmitted || !brideSubmitted}
      onClick={() => {
        handleDisplayAnswer().catch((error) => console.error(error))
      }}
    >
      {sending && <LoadingIcon />}
      表示
    </button>
  )

  const EvaluateButton: FC = () => (
    <Fragment>
      <button
        className="btn"
        onClick={() => {
          handleEvaluateAnswer('MATCH').catch((error) => console.error(error))
        }}
      >
        {sending && <LoadingIcon />}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green" className="h-6 w-6">
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
          handleEvaluateAnswer('NOT_MATCH').catch((error) => console.error(error))
        }}
      >
        {sending && <LoadingIcon />}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" className="h-6 w-6">
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </Fragment>
  )

  const NextButton: FC = () => (
    <button
      className="btn"
      onClick={() => {
        handleNextVersion().catch((error) => console.error(error))
      }}
    >
      {sending && <LoadingIcon />}
      次へ
    </button>
  )

  const ActionButton: FC = () => {
    if (state === 'WAIT') {
      return <DisplayButton />
    }
    if (state === 'SHOW' && result === 'NONE') {
      return <EvaluateButton />
    }
    if (state === 'END') {
      return (
        <button className="btn" onClick={() => handleGameRestart()}>
          {sending && <LoadingIcon />}
          再開
        </button>
      )
    }
    return <NextButton />
  }

  if (state === 'END') {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center space-y-20 bg-base-300">
        <div className="card rounded-box flex h-20 w-80 flex-row items-center justify-center space-x-10 bg-white text-3xl">
          <div>終了しました</div>
        <button
          className="btn"
          onClick={() => {
            handleGameRestart().catch((error) => console.error(error))
          }}
        >
          再開
        </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-20 bg-base-300">
      {networkError && (
        <div role="alert" className="alert alert-error fixed top-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>インターネットが接続されていません</span>
        </div>
      )}
      <div className="tooltip" data-tip={groomSubmitted ? '回答済み' : '回答中'}>
        <div className="card rounded-box flex h-20 w-80 flex-row items-center justify-center space-x-10 bg-white text-3xl">
          <div>{config?.participants?.groomName}</div>
          {groomSubmitted ? <CheckIcon /> : <LoadingIcon />}
        </div>
      </div>
      <div className="tooltip" data-tip={brideSubmitted ? '回答済み' : '回答中'}>
        <div className="card rounded-box flex h-20 w-80 flex-row items-center justify-center space-x-10 bg-white text-3xl">
          <div>{config?.participants?.brideName}</div>
          {brideSubmitted ? <CheckIcon /> : <LoadingIcon />}
        </div>
      </div>
      <div className="flex gap-5">
        <ActionButton />
        <button
          className="btn"
          onClick={() => {
            handleGameEnd().catch((error) => console.error(error))
          }}
        >
          終了
        </button>
      </div>
    </div>
  )
}

export default IshindenshinHostPage
