import Layout from "../components/Layout";

const NEXT_PUBLIC_DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

const Bookings = () => {
  return (
    <Layout
      content={
        <div>
          <Head>
            <title>Your bookings</title>
          </Head>
          <h2>Your bookings</h2>

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
          `}</style>
        </div>
      }
    />
  );
};

// Get the bookings prop to use in the JSX above:
Bookings.getInitialProps = async ctx => {
    const response = await axios.get(`${NEXT_PUBLIC_DOMAIN_URL}/api/bookings/list`);
    return {
        bookings: response.data
    }
}

export default Bookings;
