import { User } from "../../../model";

// Need API route. Axios can POST here to create a new user.
export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end(); //Method Not Allowed
    return;
  }
  // console.log(req.body);
  const { email, password, passwordconfirmation } = req.body;

  // Make sure password fields match.
  if (password !== passwordconfirmation) {
    res.end(
      JSON.stringify({ status: "error", message: "Passwords do not match" })
    );
    return;
  }

  try {
    const user = await User.create({ email, password });
    res.end(JSON.stringify({ status: "success", message: "User added!" }));
  } catch (error) {
    res.statusCode = 500; // So a code 200 isn't returned for a failure to add to the database.
    let message = "An error occurred";
    if (error.name === "SequelizeUniqueConstraintError") {
      message = "User already exists"; // instead of displaying entire detailed error message to user.
    }
    res.end(JSON.stringify({ status: "error", message }));
  }
};
