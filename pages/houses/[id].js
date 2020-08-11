import Head from "next/head";
import houses from "../houses.json";
import Layout from "../../components/Layout";
import DateRangePicker from "../../components/DateRangePicker";

const House = (props) => {
  // We get props from the getInitialProps function below.
  // We can't assign the JSX to a content variable like we do
  // in index.js because we need to access the specific props
  // for this individual house.
  return (
    <Layout
      content={
        <div className="container">
          <Head>
            <title>{props.house.title}</title>
          </Head>
          <article>
            <img src={props.house.picture} width="100%" alt="House picture" />
            <p>
              {props.house.type} - {props.house.town}
            </p>
            <p>{props.house.title}</p>
            <p>
              {props.house.rating} ({props.house.reviewsCount})
            </p>
          </article>
          <aside>
            <h2>Add dates for prices</h2>
            <DateRangePicker
              datesChanged={(startDate, endDate) => {
                console.log(startDate, endDate);
              }}
            />
          </aside>
          <style jsx>{`
            .container {
              display: grid;
              grid-template-columns: 60% 40%;
              grid-gap: 30px;
            }

            aside {
              border: 1px solid #ccc;
              padding: 20px;
            }
          `}</style>
        </div>
      }
    />
  );
};

House.getInitialProps = ({ query }) => {
  const { id } = query;
  return {
    // get the house object with matching ID from the houses.json file.
    house: houses.filter((house) => house.id === id)[0],
  };
};

export default House;
