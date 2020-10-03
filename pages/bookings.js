import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/Layout";

const NEXT_PUBLIC_DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

const Bookings = (props) => {
  return (
    <Layout
      content={
        <div>
          <Head>
            <title>Your upcoming bookings</title>
          </Head>
          <h2>Your upcoming bookings</h2>

          <div className="bookings">
            {props.bookings.map((booking, index) => {
              return (
                <div className="booking" key={index}>
                  <img src={booking.house.picture} alt="House picture" />
                  <div>
                    <h2>
                      {booking.house.title} in {booking.house.town}
                    </h2>
                    <p>
                      Booked from{" "}
                      {new Date(booking.booking.startDate).toDateString()} to{" "}
                      {new Date(booking.booking.endDate).toDateString()}
                    </p>
                    <Link
                      href="/houses/[id]"
                      as={"/houses/" + booking.booking.houseId}
                    >
                      <a>Go to house details</a>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <style jsx>{`
            .bookings {
              display: grid;
              grid-template-columns: 100%;
              grid-gap: 40px;
            }

            .booking {
              display: grid;
              grid-template-columns: 30% 70%;
              grid-gap: 40px;
            }

            .booking img {
              width: 180px;
            }
            
            .booking h2 {
              margin-top: 0px;
            }
          `}</style>
        </div>
      }
    />
  );
};

// Get the bookings prop to use in the JSX above:
Bookings.getInitialProps = async (ctx) => {
  const response = await axios({
    method: "get",
    url: `${NEXT_PUBLIC_DOMAIN_URL}/api/bookings/list`,
    /* IMPORTANT: Need to pass headers to axios so cookies work on server side too. Otherwise we get an error if we refresh the bookings page because the app thinks we are logged out. The browser passes cookies client-side when making requests to the API. On the server-side, we must manually pass the cookie from req.headers.cookie.*/
    headers: ctx.req ? { cookie: ctx.req.headers.cookie } : undefined,
  });
  return {
    bookings: response.data,
  };
};

export default Bookings;
