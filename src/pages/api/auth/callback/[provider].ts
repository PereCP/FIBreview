import { serialize } from "cookie";
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

      let redirectUrl = "/";
      if (req.cookies.redirectAfterLogin) {
        const { pathname, search } = JSON.parse(req.cookies.redirectAfterLogin);
        redirectUrl = `${pathname}${search}`;
      }

      let array = [
        serialize("jwtToken", jwtToken, {
          maxAge: 60 * 60 * 24 * 400,
          path: "/",
        }),
        serialize("redirectAfterLogin", "", {
          maxAge: 0,
          path: "/",
        }),
      ];

      if ((profile as UserToken).isAdmin) {
        array.push(
          serialize("isAdmin", (profile as UserToken).isAdmin.toString(), {
            maxAge: 60 * 60 * 24 * 400,
            path: "/",
          }),
        );
      }

      res.setHeader("Set-Cookie", array);
      res.redirect(redirectUrl);
    },
  )(req, res);
}
