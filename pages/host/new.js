import { useState } from "react";
import Head from "next/head";

import Layout from "../../components/Layout";

const NewHouse = () => {
  const [title, setTitle] = useState("");

  return (
    <Layout
      content={
        <div>
          <Head>
            <title>Add a new house</title>
          </Head>

          <form
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                const response = await axios.post("/api/host/new", {
                  house: {
                    title,
                  },
                });
                if (response.data.status === "error") {
                  alert(response.data.message);
                  return;
                }

                console.log(response);
                goto("/host");
              } catch (error) {
                alert(error.response.data.message);
                return;
              }
            }}
          >
            <input
              id="title"
              type="text"
              placeholder="House title"
              onChange={(event) => setTitle(event.target.value)}
            />
            <button>Add house</button>
          </form>

          <style jsx>{``}</style>
        </div>
      }
    />
  );
};

export default NewHouse;
