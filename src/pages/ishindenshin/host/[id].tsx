import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Image from "next/image";
import { type NextPage } from "next";
import { api } from "../../../utils/api";
import type { FC } from "react";
import { Fragment, useState } from "react";
import { useWindowSize } from "../../../hooks/useWindowSize";
import type { IshinDenshinSessionState } from "@prisma/client";

type Props = {
  sessionId: string;
};

const Loding: FC = () => {
  return (
    <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
    </svg>
  )
}

const Check: FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="green" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

const Host: NextPage<Props> = ({ sessionId }) => {
  const [groomSubmited, setGroomSubmited] = useState<boolean>(false);
  const [brideSubmited, setBrideSubmited] = useState<boolean>(false);
  const [version, setVersion] = useState<number>(1);
  const [state, setState] = useState<IshinDenshinSessionState>('WAIT');
  const getGroomSubmited = api.ishindenshin.getSubmited.useQuery({
    sessionId,
    version,
    answereName: 'groom',
  }, {
    onSuccess: (res) => {
      setGroomSubmited(res.submited);
    }
  });
  const getBrideSubmited = api.ishindenshin.getSubmited.useQuery({
    sessionId,
    version,
    answereName: 'bride',
  }, {
    onSuccess: (res) => {
      setBrideSubmited(res.submited);
    }
  });
  const getStatus = api.ishindenshin.getStatus.useQuery({ sessionId }, {
    onSuccess: (res) => {
      setVersion(res.version);
      setState(res.state);
      getGroomSubmited.refetch().catch((e) => console.error(e));
      getBrideSubmited.refetch().catch((e) => console.error(e));
    }
  });
  const updateState = api.ishindenshin.updateState.useMutation();
  const handleDisplayAnswer = async () => {
    await updateState.mutateAsync({ sessionId, state: 'SHOW' });
    await getStatus.refetch();
  }
  const incrementVersion = api.ishindenshin.incrementVersion.useMutation();
  const handleNextVersion = async () => {
    await incrementVersion.mutateAsync({ sessionId });
    await getStatus.refetch();
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center space-y-20 bg-base-300">
      <div className="tooltip" data-tip={groomSubmited ? '回答済み' : '回答中'}>
        <div className="flex flex-row space-x-10 h-20 w-80 text-3xl card bg-white rounded-box items-center justify-center">
          <div>新郎🤵🏻‍♂️</div>
          {groomSubmited ? <Check /> : <Loding />}
        </div>
      </div>
      <div className="tooltip" data-tip={brideSubmited ? '回答済み' : '回答中'}>
        <div className="flex flex-row space-x-10 h-20 w-80 text-3xl card bg-white rounded-box items-center justify-center">
          <div>新婦👰🏻‍♀️</div>
          {brideSubmited ? <Check /> : <Loding />}
        </div>
      </div>
      <div className="flex space-x-10">
        <button className="btn" disabled={!groomSubmited || !brideSubmited || state === 'SHOW'} onClick={() => { handleDisplayAnswer().catch((e) => console.error(e)) }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
          </svg>
        </button>
        <button className="btn" disabled={!groomSubmited || !brideSubmited || state !== 'SHOW'} onClick={() => { handleNextVersion().catch((e) => console.error(e)) }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
          </svg>
        </button>
      </div>
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


export default Host;