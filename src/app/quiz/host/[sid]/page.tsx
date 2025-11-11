import { Container } from '../../../../components/quizHost/Container'

type PageProps = {
  params: {
    sid: string
  }
}

const QuizHostPage = ({ params }: PageProps) => {
  const { sid: sessionId } = params

  return (
    <div className="h-screen w-screen bg-neutral-200">
      <div className="drawer drawer-end">
        <input id="participant-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label htmlFor="participant-drawer" className="btn-primary btn drawer-button absolute bottom-10 right-10">
            参加者画面
          </label>
          <div className="flex h-full items-center justify-center">
            <Container sessionId={sessionId} />
          </div>
        </div>
        <div className="drawer-side">
          <label htmlFor="participant-drawer" className="drawer-overlay"></label>
          <iframe
            className="scale-75 border border-black"
            width="393px"
            height="100%"
            src={`/quiz/participant/${sessionId}?pid=demo`}
          />
        </div>
      </div>
    </div>
  )
}

export default QuizHostPage
