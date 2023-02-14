import { type NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className="p-10">
      <ul className="space-y-4 list-disc">
        <li>
          <Link href="/ishindenshin" className="link  link-primary">
            以心伝心ゲーム
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Home;
