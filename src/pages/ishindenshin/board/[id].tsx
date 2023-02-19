import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Image from "next/image";
import { type NextPage } from "next";
import { api } from "../../../utils/api";
import { FC, Fragment, useState } from "react";
import { useWindowSize } from "../../../hooks/useWindowSize";
import type { IshinDenshinSessionState, IshinDenshinSessionResult } from "@prisma/client";

type Props = {
  sessionId: string;
};

const Board: NextPage<Props> = ({ sessionId }) => {
  const [version, setVersion] = useState<number>(1);
  const [state, setState] = useState<IshinDenshinSessionState>('WAIT');
  const [result, setResult] = useState<IshinDenshinSessionResult>('NONE');
  const { width } = useWindowSize();
  const groomAnswer = api.ishindenshin.getAnswer.useQuery({
    sessionId,
    version,
    answereName: 'groom',
  });
  const brideAnswer = api.ishindenshin.getAnswer.useQuery({
    sessionId,
    version,
    answereName: 'bride',
  });
  api.ishindenshin.getStatus.useQuery({ sessionId }, {
    onSuccess: (res) => {
      setVersion(res.version);
      setState(res.state);
      setResult(res.result);
      if (res.state === 'SHOW') {
        groomAnswer.refetch().catch((e) => console.error(e));
        brideAnswer.refetch().catch((e) => console.error(e));
      }
    },
    refetchInterval: process.env.NODE_ENV === 'development' ? false : 5000,
  });
  const AnswerResult: FC = () => {
    return <div className="absolute">
      {(() => {
        switch (result) {
          case 'MATCH':
            return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="green" className="w-80 h-80">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          case 'NOT_MATCH':
            return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="w-80 h-80">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          case 'NONE':
            return null;
        }
      })()}
    </div>
  }
  return (
    <div className="w-screen h-screen bg-neutral-200 flex justify-center items-center">
      <AnswerResult />
      {groomAnswer.data?.boardImageUrl && brideAnswer.data?.boardImageUrl && state === 'SHOW' ?
        <Fragment>
          {/* NOTE: heightが特に意味ない */}
          <Image className="bg-white m-10" src={groomAnswer.data.boardImageUrl} alt="groom answer" width={width / 3} height={0} />
          <Image className="bg-white m-10" src={brideAnswer.data.boardImageUrl} alt="bride answer" width={width / 3} height={0} />
        </Fragment>
        : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="pink" className="animate-bounce w-1/3 h-1/3">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      }
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