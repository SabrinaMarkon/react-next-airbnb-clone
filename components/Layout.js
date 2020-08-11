import { useState } from "react";
import Header from "./Header";
import Modal from "./Modal";

const Layout = (props) => {
  // the props.content property comes from the content prop
  // passed to Layout from its parent components.
  const [showModal, setShowModal] = useState(true);
  return (
    <div>
      <Header />
      <main>{props.content}</main>
      {showModal && <Modal close={() => setShowModal(false)}>test</Modal>}
      {/* Global Styles */}
      <style jsx global>{`
        body {
          margin: 0;
          font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
        }
      `}</style>
      {/* Styles just for main tag */}
      <style jsx>{`
        main {
          position: relative;
          max-width: 56em;
          background-color: white;
          padding: 2em;
          margin: 0 auto;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default Layout;
