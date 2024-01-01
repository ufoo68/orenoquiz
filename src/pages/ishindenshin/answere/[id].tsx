import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { type NextPage } from 'next'
import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import type ReactSignatureCanvas from 'react-signature-canvas'
import { api } from '../../../utils/api'
import type { IshinDenshinSessionState } from '@prisma/client'

type Props = {
  sessionId: string
  answereName: string
}

const Answere: NextPage<Props> = ({ sessionId, answereName }) => {
  const ref = useRef<ReactSignatureCanvas>(null)
  const [version, setVersion] = useState<number>(1)
  const [submited, setSubmited] = useState<boolean>(false)
  const [state, setState] = useState<IshinDenshinSessionState>('WAIT')
  const [networkError, setNetworkError] = useState<boolean>(true)
  const [sending, setSending] = useState<boolean>(false)
  const disabled = submited || state === 'SHOW'
  const getSubmited = api.ishindenshin.getSubmited.useQuery(
    { sessionId, answereName, version },
    {
      onSuccess: (res) => {
        setSubmited(res.submited)
      },
    }
  )
  const getStatus = api.ishindenshin.getStatus.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setVersion(res.version)
        setState(res.state)
        if (res.state === 'WAIT') {
          getSubmited.refetch().catch((e) => console.error(e))
        }
        setNetworkError(false)
      },
      onError: () => {
        setNetworkError(true)
      },
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )
  const submitAnswer = api.ishindenshin.submitAnswer.useMutation()
  useEffect(() => {
    if (state === 'WAIT') {
      ref.current?.clear()
    }
  }, [state])

  const handleSubmitAnser = async () => {
    const isOk = window.confirm('回答を送信しますか？')
    if (!isOk) {
      return
    }
    setSending(true)
    const boardImageUrl = ref.current?.getCanvas().toDataURL() as string
    await submitAnswer.mutateAsync({
      sessionId,
      version,
      answereName,
      boardImageUrl,
    })
    await getStatus.refetch()
    setSending(false)
  }
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-5 bg-neutral-200">
      {networkError && (
        <div role="alert" className="alert alert-error">
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
          <span>ネットワークエラー</span>
        </div>
      )}
      <SignatureCanvas
        penColor="rgb(0,0,0)"
        canvasProps={{
          className: `artboard artboard-demo w-3/4 h-2/3 ${
            disabled ? 'pointer-events-none' : 'pointer-events-auto'
          }`,
        }}
        ref={ref}
      />
      <div className="flex flex-row space-x-52">
        <button
          className="btn btn-wide"
          onClick={() => ref.current?.clear()}
          disabled={disabled}
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
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
        </button>
        <button
          className="btn btn-wide"
          onClick={() => {
            handleSubmitAnser().catch((e) => console.error(e))
          }}
          disabled={disabled}
        >
          {sending && <Loding />}
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
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  )
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

export const getServerSideProps = (
  context: GetServerSidePropsContext
): GetServerSidePropsResult<Props> => {
  const { id, name } = context.query
  if (typeof id !== 'string' || typeof name !== 'string') {
    return { notFound: true }
  }
  return { props: { sessionId: id, answereName: name } }
}

export default Answere
