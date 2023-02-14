import { type NextPage } from "next";
import Link from "next/link";
import { api } from "../../utils/api";

const Ishindenshin: NextPage = () => {
  const createIshindenshin = api.ishindenshin.create.useMutation();
  const getAllIshindenshin = api.ishindenshin.getAll.useQuery();
  const deleteIshindenshin = api.ishindenshin.delete.useMutation();

  const handleCreateIshindenshin = async () => {
    await createIshindenshin.mutateAsync({ answereCount: 2 });
    await getAllIshindenshin.refetch();
  };

  const handleDeleteIshindenshin = async (sessionId: string) => {
    await deleteIshindenshin.mutateAsync({ sessionId });
    await getAllIshindenshin.refetch();
  };

  if (!getAllIshindenshin?.data) {
    return <progress className="progress" />
  }

  return (
    <div className="p-10">
      <button className="btn mb-5 float-right" onClick={() => { handleCreateIshindenshin().catch((e) => { console.error(e) }) }}>以心伝心ゲーム作成</button>
      <table className="table w-full">
        <thead>
          <tr>
            <th>セッションID</th>
            <th>参加人数</th>
            <th>バージョン</th>
            <th>ステータス</th>
            <th>リンク</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {getAllIshindenshin.data.map((q) =>
            <tr key={q.id}>
              <th>{q.id}</th>
              <th>{q.answereCount}</th>
              <th>{q.version}</th>
              <th>{q.state}</th>
              <th className="space-x-4">
                <Link href={`/ishindenshin/answere/${q.id}?name=test1`} legacyBehavior passHref>
                  <a target="_blank" rel="noopener noreferrer" className="link  link-primary">
                    解答者１
                  </a>
                </Link>
                <Link href={`/ishindenshin/answere/${q.id}?name=test2`} legacyBehavior passHref>
                  <a target="_blank" rel="noopener noreferrer" className="link  link-primary">
                    解答者２
                  </a>
                </Link>
                <Link href={`/ishindenshin/host/${q.id}`} legacyBehavior passHref>
                  <a target="_blank" rel="noopener noreferrer" className="link  link-primary">
                    司会者用
                  </a>
                </Link>
                <Link href={`/ishindenshin/board/${q.id}`} legacyBehavior passHref>
                  <a target="_blank" rel="noopener noreferrer" className="link  link-primary">
                    共有用
                  </a>
                </Link>
              </th>
              <th><button className="btn btn-error" onClick={() => { handleDeleteIshindenshin(q.id).catch((e) => { console.error(e) }) }}>削除</button></th>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Ishindenshin;
