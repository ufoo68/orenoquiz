import { type NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className="w-screen h-screen bg-neutral-200 flex justify-center items-center space-y-5 flex-col overflow-y-scroll">
      <div className="card w-80 bg-base-100 shadow-xl mt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <figure><img src="/quiz.jpg" alt="ishindenshin" /></figure>
        <div className="card-body">
          <h2 className="card-title">シンプルクイズ</h2>
          <p>シンプルなクイズゲームです</p>
          <div className="card-actions justify-end">
            <Link href="/quiz">
              <button className="btn btn-primary">このゲームを遊ぶ</button>
            </Link>
          </div>
        </div>
      </div>
      <div className="card w-80 bg-base-100 shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <figure><img src="/ishindenshin.jpg" alt="ishindenshin" /></figure>
        <div className="card-body">
          <h2 className="card-title">以心伝心ゲーム</h2>
          <p>ホワイトボードを使って二人の息を揃えるゲームです</p>
          <div className="card-actions justify-end">
            <Link href="/ishindenshin">
              <button className="btn btn-primary">このゲームを遊ぶ</button>
            </Link>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Home;
