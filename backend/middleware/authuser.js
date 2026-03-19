import jwt from "jsonwebtoken";
import UsersModel from "../model/Users.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await UsersModel.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.log("JWT ERROR:", error.message);
      return res.status(401).json({ msg: "Token failed" });
    }
  } else {
    return res.status(401).json({ msg: "No token provided" });
  }
};

export default protect;