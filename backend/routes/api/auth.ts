import { Express } from "express";
import { signin } from "../../controllers/signin";
import { signup } from "../../controllers/signup";
import { signveried } from "../../controllers/signveried";
import { checkDuplicateUsernameOrEmail } from "../../middlewares/checkDuplicateUsernameOrEmail";
import { verifyToken } from "../../middlewares/verifyToken";

export default function (app: Express) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/auth/signup",
    [checkDuplicateUsernameOrEmail],
    signup
  );

  app.post("/api/auth/signin", signin);
  app.post("/api/auth/signverify", [verifyToken], signveried)
};
