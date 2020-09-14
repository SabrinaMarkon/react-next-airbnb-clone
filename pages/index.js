// For the list of houses.

import fetch from "isomorphic-unfetch";
import Head from "next/head";
import House from "../components/House";
import Layout from "../components/Layout";

const NEXT_PUBLIC_DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

const Index = (props) => {
  return (
    <Layout
      content={
        <div>
          <Head>
            <title>NextBNB</title>
          </Head>
          <h1>Welcome to NextBNB! Places to stay:</h1>
          <div className="houses">
            {props.houses.map((house, index) => {
              return <House key={index} {...house} />;
            })}
          </div>
          <style jsx>{`
            .houses {
              display: grid;
              grid-template-columns: 50% 50%;
              grid-template-rows: 300px 300px;
              grid-gap: 40px;
            }
          `}</style>
        </div>
      }
    />
  );
};

// Get the houses from the database first to populate the houses
// array in the JSX above, so there is data available for the first
// page render.
// TODO: Add pagination.
Index.getInitialProps = async () => {
  // domain and port hardcoded because full path is needed. 
  // Extract to env variable instead.
  const res = await fetch(`${NEXT_PUBLIC_DOMAIN_URL}/api/houses`);
  const houses = await res.json();
  return {
    houses,
  };
};

export default Index;
