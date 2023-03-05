import { type NextPage } from 'next'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { Container } from '../../../components/quizHost/Container'

type Props = {
  sessionId: string
}

const Host: NextPage<Props> = ({ sessionId }) => {
  return (
    <div className="h-screen w-screen bg-neutral-200">
      <div className="drawer drawer-end">
        <input
          id="participant-drawer"
          type="checkbox"
          className="drawer-toggle"
        />
        <div className="drawer-content">
          <label
            htmlFor="participant-drawer"
            className="btn-primary drawer-button btn absolute bottom-10 right-10"
          >
            参加者画面
          </label>
          <div className="flex h-full justify-center items-center">
            <Container sessionId={sessionId} />
          </div>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="participant-drawer"
            className="drawer-overlay"
          ></label>
          <iframe
            className="scale-75 border border-black"
            width="393px"
            height="100%"
            src={`/quiz/participant/${sessionId}`}
          />
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps = (
  context: GetServerSidePropsContext
): GetServerSidePropsResult<Props> => {
  const { sid } = context.query
  if (typeof sid !== 'string') {
    return { notFound: true }
  }
  return { props: { sessionId: sid } }
}

export default Host
