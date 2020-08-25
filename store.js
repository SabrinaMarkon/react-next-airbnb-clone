import { createStore, action } from "easy-peasy";

// Centralize state
export default createStore({
  modals: {
    showModal: false,
    showLoginModal: false,
    showRegistrationModal: false,
    setShowModal: action((state) => {
      state.showModal = true;
    }),
    setHideModal: action((state) => {
      state.showModal = false;
    }),
    setShowLoginModal: action((state) => {
      state.showModal = true;
      state.showLoginModal = true;
      state.showRegistrationModal = false;
    }),
    setShowRegistrationModal: action((state) => {
      state.showModal = true;
      state.showLoginModal = false;
      state.showRegistrationModal = true;
    }),
  },
  // In any component, get the username (email in this app) with const user = useStoreState(state => state.user.user) - see below user.user property. Knowing the user means we know they are logged in.
  user: {
    user: null,
    setUser: action((state, payload) => {
      state.user = payload;
    }),
  },
});
