import { type NextPage } from 'next'
import { useState } from 'react'
import { api } from '../../../utils/api'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { EntryForm } from '../../../components/quizParticipant/EntryForm'
import { useRouter } from 'next/router'
import type { QuizSessionState } from '../../../types/quizSession'
import { getQuizSessionStateEntry } from '../../../types/quizSession'
import { AnswerForm } from '../../../components/quizParticipant/AnswerForm'

type Props = {
  sessionId: string
  participantId: string
}

const Participant: NextPage<Props> = ({
  sessionId,
  participantId: initailParticipantId,
}) => {
  const router = useRouter()
  const [name, setName] = useState<string>('')
  const [participantId, setParticipantId] =
    useState<string>(initailParticipantId)
  const [state, setState] = useState<QuizSessionState>(
    getQuizSessionStateEntry()
  )
  api.quizSession.getState.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        setState(res)
      },
    }
  )
  const createParticipant = api.quizParticipant.create.useMutation()
  const handleSubmitName = async () => {
    const pid = await createParticipant.mutateAsync({ sessionId, name })
    await router.push(`/quiz/participant/${sessionId}?pid=${pid}`)
    setParticipantId(pid)
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-neutral-200">
      {(() => {
        if (state.type === 'entry') {
          return (
            <EntryForm
              name={name}
              participantId={participantId}
              handleChangeName={(n) => setName(n)}
              handleSubmitName={handleSubmitName}
            />
          )
        } else if (state.type === 'question') {
          return <AnswerForm participantId={participantId} />
        }
      })()}
    </div>
  )
}

export const getServerSideProps = (
  context: GetServerSidePropsContext
): GetServerSidePropsResult<Props> => {
  const { sid, pid } = context.query

  if (typeof sid !== 'string') {
    return { notFound: true }
  }
  return {
    props: {
      sessionId: sid,
      participantId: (pid as string) ?? '',
    },
  }
}

export default Participant
