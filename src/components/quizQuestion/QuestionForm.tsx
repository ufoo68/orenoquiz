import type { QuizQuestion } from "@prisma/client";

import type { FC } from "react";
import type { QuestionContents } from "../../types/question";
import { getSelectTypeInit, getSortTypeInit } from "../../types/question";
import { QuestionFormContents } from "./QuestionFormContents";

type Props = {
  question: QuizQuestion | undefined;
  handleChangeSelectedQuestion: (params: Partial<QuizQuestion>) => void;
  handleSaveSelectedQuestion: () => void;
};



export const QuestionForm: FC<Props> = ({ question, handleChangeSelectedQuestion, handleSaveSelectedQuestion }) => {
  if (!question) {
    return <div className="w-full max-w-xs">
      <progress className="progress" />
    </div>
  }

  const contents = question.contents as QuestionContents;

  return <div className="w-full mt-5">
    <form className="w-3/4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          問題文
        </label>
        <input
          className="input input-bordered w-full max-w-xs"
          value={question.title}
          type="text"
          onChange={(e) => handleChangeSelectedQuestion({ title: e.target.value })}
        />
        <label className="block text-gray-700 text-sm font-bold mb-2">
          問題タイプ
        </label>
        <select
          className="select select-bordered w-full max-w-xs"
          value={contents.type}
          onChange={(e) => {
            const type = e.target.value;
            if (type === 'select') {
              handleChangeSelectedQuestion({ contents: getSelectTypeInit() });
            } else if (type === 'sort') {
              handleChangeSelectedQuestion({ contents: getSortTypeInit() });
            }
          }}
        >
          <option value="select">選択</option>
          <option value="sort">並べ替え</option>
        </select>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          内容
        </label>
        <QuestionFormContents contents={contents} handleSave={(contents) => {
          handleChangeSelectedQuestion({ contents })
        }} />
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
    </form>
  </div>
}