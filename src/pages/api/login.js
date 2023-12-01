import {withSessionRoute} from '../../lib/session';
import { hashPassword,verifyPassword } from '@/lib/password';
import { get_user } from "@/lib/user"


export default withSessionRoute(async (req, res) => {
  console.log('In login')
  if (req.method === 'POST') {
    const { username, password } = req.body;

    

    const user = await get_user(username);
    

    //console.log(hashedPassword)

    if (user) {
      // Set session data
      console.log("Is user")
      const verify = await verifyPassword(password, user.password)
      if (verify) {
        req.session.user = { 
            username: user.username,
            userId: user.id
        };
        await req.session.save();
        return res.status(200).json({ success: true, message: 'Logged in successfully' });
      }
      return res.status(500).json({ success: false, message: 'Check your password' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
})

