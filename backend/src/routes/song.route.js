import { Router } from "express";

import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getAllSongs, getAllFeaturedSongs, getMadeForYouSongs, getTrendingSongs } from "../controller/song.controller.js";

const router = Router();

router.get("/", protectRoute, requireAdmin, getAllSongs);
router.get("/featured",  getAllFeaturedSongs);
router.get("/made-for-you",  getMadeForYouSongs);
router.get("/trending",  getTrendingSongs);

export default router;
