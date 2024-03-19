import express from 'express'
import {
    ForgetPasswordHandler,
    ForgetVerifyHandler,
    LoginHandler,
    LogoutHandler,
    SignupHandler
} from '../controller/authentication.mjs';
const router = express.Router()


router.post("/signup", SignupHandler)
router.post("/login", LoginHandler)
router.post("/logout", LogoutHandler)
router.post("/forget-password", ForgetPasswordHandler)
router.post("/forget-password-verify", ForgetVerifyHandler)


export default router;



