import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Image from "next/image";
import { type NextPage } from "next";
import { api } from "../../../utils/api";
import { useState } from "react";
import { useWindowSize } from "../../../hooks/useWindowSize";

type Props = {
  sessionId: string;
};

const Board: NextPage<Props> = ({ sessionId }) => {
  const [version, setVersion] = useState<number>(0);
  const { width } = useWindowSize()
  const answer1 = api.ishindenshin.getAnswer.useQuery({
    sessionId,
    version,
    answereName: 'test1',
  });
  const answer2 = api.ishindenshin.getAnswer.useQuery({
    sessionId,
    version,
    answereName: 'test2',
  });
  const answerBoard1 = answer1.data?.boardImageUrl ?? '/wait.png';
  const answerBoard2 = answer2.data?.boardImageUrl ?? '/wait.png';
  return (
    <div className="w-screen h-screen bg-neutral-200 flex justify-center items-center space-x-10">
      {/* NOTE: heightが特に意味ない */}
      <Image className="bg-white" src={answerBoard1} alt="answer1" width={width / 3} height={0} />
      <Image className="bg-white" src={answerBoard2} alt="answer2" width={width / 3} height={0} />
    </div>
  );
};

export const getServerSideProps = (
  context: GetServerSidePropsContext
): GetServerSidePropsResult<Props> => {
  const { id } = context.query;
  if (typeof id !== 'string') {
    return { notFound: true };
  }
  return { props: { sessionId: id } };
};


export default Board;