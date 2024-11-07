import { NextApiRequest, NextApiResponse } from "next";

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  res.status(200).json({ id });
}
