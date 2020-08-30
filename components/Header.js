import Link from "next/link";
import { useStoreActions, useStoreState } from "easy-peasy";
import axios from "axios";

const Header = () => {
  // get the state variable and functions from the modals object in store.js.
  const setShowLoginModal = useStoreActions(
    (actions) => actions.modals.setShowLoginModal
  );

  const setShowRegistrationModal = useStoreActions(
    (actions) => actions.modals.setShowRegistrationModal
  );

  // check for logged in user - get state from easy-peasy store.
  const user = useStoreState((state) => state.user.user);
  const setUser = useStoreActions((actions) => actions.user.setUser);

  return (
    <div className="nav-container">
      <Link href="/">
        <a>
          <img src="/img/logo.png" alt="NextBNB" />
        </a>
      </Link>
      <nav>
        <ul>
          {user ? ( // if a user is logged in:
            <>
              <li className="username">{user}</li>
              <li>
                <a
                  href="#"
                  onClick={async () => {
                    await axios.post("/api/auth/logout");
                    setUser(null);
                  }}
                >
                  Log out
                </a>
              </li>
            </>
          ) : (
            // no user is logged in:
            <>
              <li>
                <a href="#" onClick={() => setShowRegistrationModal()}>
                  Sign up
                </a>
              </li>
              <li>
                <a href="#" onClick={() => setShowLoginModal()}>
                  Log in
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>
      <style jsx>{`
        .username {
          padding: 1em 0.5em;
        }

        ul {
          margin: 0;
          padding: 0;
        }

        li {
          display: block;
          float: left;
        }

        a {
          text-decoration: none;
          display: block;
          margin-right: 15px;
          color: #333;
        }

        nav a {
          padding: 1em 0.5em;
        }

        .nav-container {
          border-bottom: 1px solid #eee;
          height: 50px;
        }

        img {
          float: left;
          height: 62px;
        }

        ul {
          float: right;
        }
      `}</style>
    </div>
  );
};

export default Header;
