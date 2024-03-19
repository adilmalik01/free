import express from 'express'
import { getProfile, updateUserProfile } from '../controller/profile.mjs'
const router = express.Router()


router.get("/profile", getProfile)
router.put("/updateprofile", updateUserProfile)


export default router;
