import styles from "./index.module.css";
import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import { BagelMaker } from "../components/BagelMaker/BagelMaker";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const { data: sessionData } = useSession();

  const { data: secretBagel } = api.example.getBagels.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <>
      <Head>
        <title>Bagel Maker</title>
        <meta name="description" content="make bagels" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.overflow}>
          <BagelMaker userBagel={secretBagel && secretBagel[0]} />
        </div>
        <div className={styles.showcaseContainer}>
            <p className={styles.showcaseText}>
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
          <AuthShowcase />
        </div>
      </main>
    </>
  );
};

export default Home;

export const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className={styles.authContainer}>
      <p className={styles.showcaseText}>
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className={styles.loginButton}
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
