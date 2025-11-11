import { notFound } from 'next/navigation'

import { AnswereClient } from './AnswereClient'

type PageProps = {
  params: {
    id: string
    name: string
  }
}

const IshindenshinAnswerePage = ({ params }: PageProps) => {
  const { id, name } = params
  if (name !== 'groom' && name !== 'bride') {
    notFound()
  }

  return <AnswereClient sessionId={id} answereName={name} />
}

export default IshindenshinAnswerePage
