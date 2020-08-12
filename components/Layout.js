import { useState } from "react";
import Header from "./Header";
import Modal from "./Modal";
import LoginModal from "./LoginModal";
import RegistrationModal from "./RegistrationModal";

const Layout = (props) => {
  // the props.content property comes from the content prop
  // passed to Layout from its parent components.
  return (
    <div>
      <Header />
      <main>{props.content}</main>
      {showModal && (
        <Modal close={() => setShowModal(false)}>
          {showLoginModal && (
            <LoginModal
              showSignup={() => {
                setShowRegistrationModal(true);
                setShowLoginModal(false);
              }}
            />
          )}
          {showRegistrationModal && (
            <RegistrationModal
              showLogin={() => {
                setShowRegistrationModal(false);
                setShowLoginModal(true);
              }}
            />
          )}
        </Modal>
      )}
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
        // Modal Styles for all modals.
        button {
          background-color: rgb(255, 90, 95);
          color: white;
          font-size: 13px;
          width: 100%;
          border: none;
          height: 40px;
          border-radius: 4px;
          cursor: pointer;
        }

        input[type="text"],
        input[type="email"],
        input[type="password"] {
          display: block;
          padding: 20px;
          font-size: 20px !important;
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
          margin-bottom: 10px;
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
