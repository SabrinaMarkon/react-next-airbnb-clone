// Add a new house as a host.

import Head from "next/head";
import Layout from "../../components/Layout";
import HouseForm from ".../../components/HouseForm";

const NewHouse = () => {
  return (
    <Layout
      content={
        <>
          <Head>
            <title>Add a new house</title>
          </Head>
            {/* edit={false} means a new house from new.js, as opposed to editing a specific house in [id].js. Both use the HouseForm component. */}
            <HouseForm edit={false} />
        </>
      }
    />
  );
};

export default NewHouse;
