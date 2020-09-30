// For the details of a house added by the user who is the house owner (host):

import fetch from "isomorphic-unfetch"; // for SSR.
import axios from "axios";
import { useState } from "react";
import { useStoreActions, useStoreState } from "easy-peasy";
import Head from "next/head";
import Layout from "../../components/Layout";
import DateRangePicker from "../../components/DateRangePicker";

const NEXT_PUBLIC_DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

const EditHouse = (props) => {
  return <Layout content={<div>{props.house.title}</div>} />;
};

EditHouse.getInitialProps = async ({ query }) => {
  const { id } = query;
  const response = await axios.get(`${NEXT_PUBLIC_DOMAIN_URL}/api/host/${id}`);

  return {
    house: response.data,
  };
};

export default EditHouse;
