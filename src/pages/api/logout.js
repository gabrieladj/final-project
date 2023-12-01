import { withIronSessionApiRoute } from "iron-session/next";
import { withSessionRoute } from "@/lib/session";

export default withSessionRoute(async (req, res) => {
    req.session.destroy();
    return res.status(200).json({ ok: true });
});



