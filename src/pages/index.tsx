import { ScannerApp } from "@components/Scanner/index";

import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title data-build="1.0.2">Doc Scanner</title>
      </Head>
      <ScannerApp />
    </>
  );
}
