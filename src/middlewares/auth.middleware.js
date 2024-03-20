import jwt from "jsonwebtoken";
import User from "../../DB/Models/user.model.js";

export const auth = (accessRoles) => {
  return async (req, res, next) => {
    const { accesstoken } = req.headers;
    if (!accesstoken)
      return next(new Error("please login first", { cause: 400 }));

    // if (!accesstoken.startsWith(process.env.TOKEN_PREFIX)) return next(new Error('invalid token prefix', { cause: 400 }))

    const token = accesstoken.split(process.env.TOKEN_PREFIX)[1];
    // if (!token) return next(new Error("invalid token prefix", { cause: 400 }));

    try {

      const decodedData = jwt.verify(accesstoken, process.env.JWT_SECRET_LOGIN);
      if (!decodedData || !decodedData.id)
        return next(new Error("invalid token payload", { cause: 400 }));

      // user check
      const user = await User.findById(decodedData.id, "username email role");

      // loggdInUser ROle
      if (!user) return next(new Error("please sign up first", { cause: 404 }));

      // authorization
      if (!accessRoles.includes(user.role))
        return next(new Error("unauthorized", { cause: 401 }));
      req.authUser = user;
      next();

    } catch (error) {
      if (error == "TokenExpiredError : jwt expired") {
        const findUser = await User.findOne({ token });
        if (!findUser) return next(new Error("invalid token", { cause: 400 }));

        const userToken = jwt.sign(
          { email, id: findUser._id, loggedIn: true },
          process.env.JWT_SECRET_LOGIN,
          { expiresIn: "1d" }
        );
        findUser.token = userToken;
        await findUser.save();
        res.status(200).json({
          message: "Token is refreshed successfully",
          userToken,
        });
      }
      next(new Error("catch error in auth middleware", { cause: 500 }));
    }
  };
};
