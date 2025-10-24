import { ScannerApp } from "@components/Scanner/index";
import Head from "next/head";
import { getOffices, OfficeNames } from "@utils/getOffices"; // example server function

type HomeProps = {
  offices: OfficeNames;
};

export async function getServerSideProps() {
  const offices = getOffices().map((item) => item.name) as OfficeNames;

  return {
    props: {
      offices,
    },
  };
}

export default function Home({ offices }: HomeProps) {
  return (
    <>
      <Head>
        <title data-build="1.0.2">Doc Scanner</title>
      </Head>
      <ScannerApp offices={offices} />
    </>
  );
}
