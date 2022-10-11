import express, { RequestHandler } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { jwtIdPayload } from "../controllers/signup";
const { verify } = jsonwebtoken;
export const verifyToken: RequestHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let token = req.headers["x-access-token"] as string;

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  verify(token, process.env.DB_SECRET, (err, decoded: jwtIdPayload) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.body.username = decoded.id;
    next();
  });
};
