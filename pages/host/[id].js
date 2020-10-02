// For the details of a house added by the user who is the house owner (host):

import axios from "axios";
import Head from "next/head";
import Layout from "../../components/Layout";
import HouseForm from "../../components/HouseForm";

const NEXT_PUBLIC_DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

const EditHouse = (props) => {
  return (
    <Layout
      content={
        <>
          <Head>
            <title>Edit house</title>
          </Head>
          {/* edit={true} means we are editing a specific house as opposed to adding a new house with new.js. Both use the HouseForm component. */}
          <HouseForm edit={true} house={props.house} />
        </>
      }
    />
  );
};

EditHouse.getInitialProps = async ({ query }) => {
  const { id } = query;
  const response = await axios.get(
    `${NEXT_PUBLIC_DOMAIN_URL}/api/houses/${id}`
  );

  return {
    house: response.data,
  };
};

export default EditHouse;
