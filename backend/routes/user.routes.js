import express from "express";
import { createUser, authUser, userSearch } from "../controller/Users.controller.js";
import protect from "../middleware/authuser.js";

const router = express.Router();
router.post("/", createUser);
router.post("/login", authUser);
router.get("/", protect, userSearch);

export default router;