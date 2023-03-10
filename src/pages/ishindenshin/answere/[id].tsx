import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { type NextPage } from 'next'
import { useRef, useState } from 'react'
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
      },
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )
  const submitAnswer = api.ishindenshin.submitAnswer.useMutation()

  const handleSubmitAnser = async () => {
    const boardImageUrl = ref.current?.getCanvas().toDataURL() as string
    await submitAnswer.mutateAsync({
      sessionId,
      version,
      answereName,
      boardImageUrl,
    })
    ref.current?.clear()
    getStatus.refetch().catch((e) => console.error(e))
  }
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-5 bg-neutral-200">
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
          className="btn-wide btn"
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
          className="btn-wide btn"
          onClick={() => {
            handleSubmitAnser().catch((e) => console.error(e))
          }}
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
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
    </div>
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
