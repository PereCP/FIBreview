import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

import { connectToDatabase } from "src/lib/mongodb";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "No ID provided" });
  }

  if (Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const { db } = await connectToDatabase();
  db.collection("reviewsUnderRevision").deleteOne({
    _id: new ObjectId(id.toString()),
  });

  res.status(200).json({ id });
}
