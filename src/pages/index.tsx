import { ScannerApp } from "@components/Scanner/index";

import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Doc Scanner</title>
      </Head>
      <ScannerApp />
    </>
  );
}
