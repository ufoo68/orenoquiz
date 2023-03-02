import type { QuizQuestion } from "@prisma/client";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { type NextPage } from "next";
import { useState } from "react";
import { QuestionForm } from "../../../components/quizQuestion/QuestionForm";
import { api } from "../../../utils/api";
import { sortBy } from 'lodash';

type Props = {
  masterId: string;
};

const Question: NextPage<Props> = ({ masterId }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuestion, setSelectedQestion] = useState<QuizQuestion>();
  const getAllQuestion = api.quizQuestion.getAll.useQuery({ masterId }, {
    onSuccess: (res) => {
      setQuestions(res)
    }
  });
  const updateQuestion = api.quizQuestion.update.useMutation();
  const createQuestion = api.quizQuestion.create.useMutation();
  const handleChangeSelectedQuestion = (params: Partial<QuizQuestion>) => {
    setSelectedQestion({
      ...selectedQuestion,
      ...params,
    } as QuizQuestion)
  }
  const handleSaveSelectedQuestion = async () => {
    const { id, title, order, contents } = selectedQuestion as QuizQuestion;
    await updateQuestion.mutateAsync({
      id,
      title,
      order,
      contents,
    });
    await getAllQuestion.refetch();
  };
  const handleCreateQuestion = async () => {
    await createQuestion.mutateAsync({ masterId, order: questions.length + 1 })
    await getAllQuestion.refetch();
  };

  if (getAllQuestion.isLoading) {
    return <progress className="progress" />
  }
  return (
    <div className="w-screen h-screen bg-neutral-200 grid grid-flow-col auto-rows-max justify-items-stretch content-center space-x-5">
      <div className="drawer drawer-mobile">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">問題リスト</label>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
          <ul className="menu bg-base-100 w-56 p-2 rounded-box">
            {sortBy(questions, 'order').map((question) => <li key={question.id}><a onClick={() => setSelectedQestion(question)}>{question.title}</a></li>)}
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <button className="btn" onClick={handleCreateQuestion}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
            </button>
          </ul>
          
        </div>

      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <QuestionForm question={selectedQuestion} handleChangeSelectedQuestion={handleChangeSelectedQuestion} handleSaveSelectedQuestion={handleSaveSelectedQuestion} />
    </div>
  );
};

export const getServerSideProps = (
  context: GetServerSidePropsContext
): GetServerSidePropsResult<Props> => {
  const { mid } = context.query;
  if (typeof mid !== 'string') {
    return { notFound: true };
  }
  return { props: { masterId: mid } };
};

export default Question;
