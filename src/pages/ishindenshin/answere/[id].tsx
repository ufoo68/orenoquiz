import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { type NextPage } from "next";
import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import type ReactSignatureCanvas from "react-signature-canvas";
import { api } from "../../../utils/api";

type Props = {
  sessionId: string;
  answereName: string;
};

const Answere: NextPage<Props> = ({ sessionId, answereName }) => {
  const ref = useRef<ReactSignatureCanvas>(null);
  const getStatus = api.ishindenshin.getStatus.useQuery({ sessionId });
  const version = getStatus.data?.version ?? 0;

  const submitAnswer = api.ishindenshin.submitAnswer.useMutation();
  const handleSubmitAnser = async () => {
    const boardImageUrl = ref.current?.getCanvas().toDataURL() as string;
    await submitAnswer.mutateAsync({
      sessionId,
      version,
      answereName,
      boardImageUrl,
    });
    ref.current?.clear();
  }
  return (
    <div className="w-screen h-screen bg-neutral-200 flex justify-center flex-col items-center space-y-5">
      <SignatureCanvas penColor='black'
        canvasProps={{ className: 'artboard artboard-demo w-10/12 h-5/6' }} ref={ref} />
      <div className="flex flex-row space-x-52">
        <button className="btn btn-wide" onClick={() => ref.current?.clear()}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <button className="btn btn-wide" onClick={handleSubmitAnser}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const getServerSideProps = (
  context: GetServerSidePropsContext
): GetServerSidePropsResult<Props> => {
  const { id, name } = context.query
  if (typeof id !== 'string' || typeof name !== 'string') {
    return { notFound: true }
  }
  return { props: { sessionId: id, answereName: name } }
}

export default Answere;
