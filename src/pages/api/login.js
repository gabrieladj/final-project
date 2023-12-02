import {withSessionRoute} from '../../lib/session';
import { hashPassword,verifyPassword } from '@/lib/password';
import { get_user } from "@/lib/user"


export default withSessionRoute(async (req, res) => {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user = await get_user(username);

    //console.log(hashedPassword)

    if (user) {
      const verify = await verifyPassword(password, user.password)
      if (verify) {
        // Set session data
        req.session.user = { 
            username: user.username,
            userId: user.id
        };
        await req.session.save();
        return res.status(200).json({ success: true, message: 'Logged in successfully' });
      }
      else {
        const errorMessage = `Failed Login: Invalid password for ${username}`;
        logError(ipAddress, errorMessage);
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    } else {
      const errorMessage = `Failed Login: Invalid username (${username})`;
      logError(ipAddress, errorMessage);
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
})

function logError(ipAddress, errorMessage) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [IP: ${ipAddress}] ${errorMessage}`);
}