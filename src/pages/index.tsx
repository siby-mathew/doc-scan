import { Scanner } from "@components/Scanner";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Doc Scanner</title>
      </Head>
      <Scanner />
    </>
  );
}
