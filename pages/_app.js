// For wrapping the Nextjs app into a component supplied by easy-peasy (our state management library).
import App from "next/app";
import { StoreProvider } from "easy-peasy";
import store from "../store";

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
