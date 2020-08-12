// Need API route. Axios can POST here to create a new user.
export default (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end(); //Method Not Allowed
    return;
  }
  console.log("POST request received");
};
