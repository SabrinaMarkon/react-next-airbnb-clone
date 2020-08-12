// For wrapping the Nextjs app into a component supplied by easy-peasy (our state management library).
import App from "next/app";
import { StoreProvider } from "easy-peasy";
import store from "../store";

// workaround for bug where <Link>s in index.js->House.js to [id].js do nothing when clicked!
// See https://github.com/vercel/next.js/issues/5291
import "../blank.css"; 

// This operation makes now our store available in every component of the app:

export default class extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <StoreProvider store={store}>
        <Component {...pageProps} />
      </StoreProvider>
    );
  }
}
