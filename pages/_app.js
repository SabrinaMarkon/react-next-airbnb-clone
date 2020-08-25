// For wrapping the Nextjs app into a component supplied by easy-peasy (our state management library).
import App from "next/app";
import { StoreProvider } from "easy-peasy";
import store from "../store";

// workaround for bug where <Link>s in index.js->House.js to [id].js do nothing when clicked!
// See https://github.com/vercel/next.js/issues/5291
import "../blank.css";

// This operation makes now our store available in every component of the app:
function MyApp({ Component, pageProps, user }) {
  if (user) {
    store.getActions().user.setUser(user);
  }
  return (
    <StoreProvider store={store}>
      <Component {...pageProps} />
    </StoreProvider>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  let user = null;
  // if we do have the user info from the server, return it by adding it
  // as a prop, otherwise user will = null by default.
  if (
    appContext.ctx.req &&
    appContext.ctx.req.session &&
    appContext.ctx.req.session.passport &&
    appContext.ctx.req.session.passport.user
  ) {
    user = appContext.ctx.req.session.passport.user;
  }
  return { ...appProps, user: user };
};

export default MyApp;
