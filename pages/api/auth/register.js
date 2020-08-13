import { User } from '../../../model';

// Need API route. Axios can POST here to create a new user.
export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end(); //Method Not Allowed
    return;
  }
  // console.log(req.body);
  const { email, password, passwordconfirmation } = req.body;
  
  try {
    const user = await User.create({ email, password });
    res.end(JSON.stringify({ status: 'success', message: 'User added!' }));
  } catch (error) {
    res.end(JSON.stringify({ status: 'error', error }));
  }
};
