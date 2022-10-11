import express from "express";
import jwt from 'jsonwebtoken';
import { User } from "../models/User";

export const signveried = (req: express.Request, res: express.Response) => {
  User.findOne({
    username: req.body.username
  })
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var token = jwt.sign({ id: user.id }, process.env.DB_SECRET, {
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
