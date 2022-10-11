import bcrypt from 'bcryptjs';
import { User } from "../models/User";
import jwt from 'jsonwebtoken'
import express from 'express'
export type jwtIdPayload = {
  id: string
}
export const signup = (req: express.Request, res: express.Response) => {
  console.log(req.body)
  // TODO: validate user/email/password
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    var token = jwt.sign({ id: user.id } as jwtIdPayload, process.env.DB_SECRET, {
      expiresIn: 86400 // 24 hours
    });
    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      accessToken: token
    });

  });
};
