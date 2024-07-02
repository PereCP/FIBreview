import { NextApiRequest, NextApiResponse } from "next";

import { UserToken } from "src/@types";
import { createToken } from "src/lib/jwt";

import passport from "../../../../lib/passport";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  passport.authenticate(
    req.query.provider as string,
    // eslint-disable-next-line no-unused-vars
    async (err: any, profile: UserToken, _info: any) => {
      if (err) {
        return res.redirect("/login");
      }

      if (!profile) {
        return res.redirect("/login");
      }

      const jwtToken = await createToken(profile);
      res.setHeader("Set-Cookie", `jwtToken=${jwtToken}; Path=/;`);
      res.redirect("/");
    },
  )(req, res);
}
