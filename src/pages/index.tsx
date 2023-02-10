import { type NextPage } from "next";

import { api } from "../utils/api";

const Home: NextPage = () => {
  const quiz = api.quizMaster.getAll.useQuery();

  if (!quiz.data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-10">
      <table className="table w-full">
        <thead>
          <tr>
            <th>id</th>
            <th>title</th>
          </tr>
        </thead>
        <tbody>
          {quiz.data.map((q) => 
            <tr key={q.id}>
              <th>{q.id}</th>
              <th>{q.title}</th>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
