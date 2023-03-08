import { type NextPage } from 'next'
import { useState } from 'react'
import { api } from '../../../utils/api'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { EntryForm } from '../../../components/quizParticipant/EntryForm'
import { useRouter } from 'next/router'
import type { QuizSessionState } from '../../../types/quizSession'
import { getQuizSessionStateEntry } from '../../../types/quizSession'
import { AnswerForm } from '../../../components/quizParticipant/AnswerForm'
import { ResultCard } from '../../../components/quizParticipant/ResultCard'
import { ScoreCard } from '../../../components/quizParticipant/ScoreCard'
import { EndCard } from '../../../components/common/EndCard'

type Props = {
  sessionId: string
  participantId: string
}

const Participant: NextPage<Props> = ({
  sessionId,
  participantId: initailParticipantId,
}) => {
  const router = useRouter()
  const [participantId, setParticipantId] =
    useState<string>(initailParticipantId)
  const [state, setState] = useState<QuizSessionState>(
    getQuizSessionStateEntry()
  )
  api.quizSession.getState.useQuery(
    { sessionId },
    {
      onSuccess: (res) => {
        if (res) {
          setState(res)
        }
      },
      refetchInterval: process.env.NODE_ENV === 'development' ? false : 1000,
    }
  )
  const createParticipant = api.quizParticipant.create.useMutation()
  const handleSubmitName = async (name: string) => {
    const pid = await createParticipant.mutateAsync({ sessionId, name })
    await router.push(`/quiz/participant/${sessionId}?pid=${pid}`)
    setParticipantId(pid)
  }

  return (
    <div className="m-0 flex h-[99vh] w-screen items-center justify-center overflow-y-hidden bg-neutral-200">
      {(() => {
        if (state.type === 'entry' || !participantId) {
          return (
            <EntryForm
              participantId={participantId}
              handleSubmitName={handleSubmitName}
            />
          )
        } else if (state.type === 'question') {
          return (
            <AnswerForm
              sessionId={sessionId}
              participantId={participantId}
              questionId={state.questionId}
            />
          )
        } else if (state.type === 'answer') {
          return (
            <ResultCard
              sessionId={sessionId}
              participantId={participantId}
              questionId={state.questionId}
            />
          )
        } else if (state.type === 'rank') {
          return (
            <ScoreCard sessionId={sessionId} participantId={participantId} />
          )
        } else if (state.type === 'end') {
          return <EndCard />
        }
        return <>error</>
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
