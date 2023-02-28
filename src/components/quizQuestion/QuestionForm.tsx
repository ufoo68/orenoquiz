import type { QuizQuestion } from "@prisma/client";
import type { FC } from "react";

type Props = {
  question: QuizQuestion | undefined;
  handleChangeSelectedQuestion: (params: Partial<QuizQuestion>) => void;
  handleSaveSelectedQuestion: () => void;
}

export const QuestionForm: FC<Props> = ({ question, handleChangeSelectedQuestion, handleSaveSelectedQuestion }) => {

  return <div className="w-full max-w-xs">
    {question ? <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          問題文
        </label>
        <input
          className="shadow rounded w-full py-2 px-3 text-gray-700 leading-tight"
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={question.title}
          type="text"
          onChange={(e) => handleChangeSelectedQuestion({ title: e.target.value })}
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={handleSaveSelectedQuestion}
        >
          保存
        </button>
      </div>
    </form> : <progress className="progress" />}

  </div>
}