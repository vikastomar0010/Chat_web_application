import UsersModel from "../model/Users.js";
import generatetoken from "../db/generatetoken.js";

// ✅ REGISTER USER
const createUser = async (req, res) => {
  try {
    const { email, name, password, pic } = req.body;

    const userExists = await UsersModel.findOne({ email });

    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const newUser = await UsersModel.create({
      email,
      name,
      password,
      pic,
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      pic: newUser.pic,
      token: generatetoken(newUser._id),
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ LOGIN USER
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UsersModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const isMatch = await user.matchpassword(password);

    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generatetoken(user._id),
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ SEARCH USER
const userSearch = async (req, res) => {
  try {
    const search = req.query.search;

    // ✅ prevent empty or undefined search
    if (!search || !search.trim()) {
      return res.status(200).json([]);
    }

    const keyword = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const users = await UsersModel.find(keyword).find({
      _id: { $ne: req.user._id },
    });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export { createUser, authUser, userSearch };