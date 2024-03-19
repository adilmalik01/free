import moment from 'moment';
import jwt from 'jsonwebtoken'
import mailgen from 'mailgen'
import express, { json } from 'express'
import nodemailer from 'nodemailer'
import { nanoid, customAlphabet } from 'nanoid'
import {
    stringToHash,
    verifyHash,
    validateHash
} from "bcrypt-inzi";

import client from '../database/mongodb.mjs'
import e from 'express';
let db = client.db("VottingApp")
let userCollection = db.collection("openVoiceHubUser")
let otpCollection = db.collection("otpCollection")



export const SignupHandler = async (req, res) => {

    if (!req.body.firstName ||
        !req.body.lastName ||
        !req.body.email ||
        !req.body.password
    ) {
        res.send(`
            required parameter is missing
            `)
        return;
    }
    let userData = req.body
    userData.email = userData.email.toLowerCase()
    if (!userData.email.endsWith("@gmail.com")) {
        res.send("Enter Valid Email")
        return;
    }

    const result = await userCollection.findOne({ email: userData.email })
    if (result) {
        console.log("user Already Exist");
        res.send("Email Alreadt Exist");
        return;
    } else {

        try {

            const hash = await stringToHash(userData.password);
            let insertUser = await userCollection.insertOne(
                {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    password: hash,
                    createdAt: moment(new Date().getTime()).format('LL')
                }
            )
            console.log("sign up is workin", insertUser);
            res.send("Signup Succesfully")
        } catch (e) {
            console.log(e);
        }
    }

}

export const LoginHandler = async (req, res) => {

    if (
        !req.body.email ||
        !req.body.password
    ) {
        res.send(`
          required parameter is missing
        `)
        return;
    }
    let userData = req.body
    userData.email = userData.email.toLowerCase()

    if (!userData.email.endsWith("@gmail.com")) {
        res.send("Enter Valid Email")
        return;
    }
    try {
        const result = await userCollection.findOne({ email: userData.email })
        if (result) {
            const verifyPass = await verifyHash(userData.password, result.password);
            if (verifyPass) {

                const token = jwt.sign({
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: result.email,
                    _id: result._id
                }, 'shhhhh');

                console.log(token);

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    expires: new Date(Date.now() + 86400000)
                })

                console.log(res.cookie.token);
                res.send({
                    msg: "Login Sussecfull",
                    data: {
                        firstName: result.firstName,
                        lastName: result.lastName,
                        email: result.email,
                        _id: result._id,
                    }
                })

            } else {
                res.status(401).send("Incorrect Email And password")
            }
        } else {
            res.status(401).send("Incorrect Email And password")
        }
    } catch (e) {
        console.log("error", e);
    }

}


export const LogoutHandler = (req, res) => {
    res.cookie("token", "", {
        secure: true,
        httpOnly: true
    })
    res.send("ok")
}






export const ForgetPasswordHandler = async (req, res) => {

    if (!req.body.email) {
        res.status(400).send(`
          required parameter is missing
        `)
        return;
    }

    let userData = req.body
    userData.email = userData.email.toLowerCase()

    if (!userData.email.endsWith("@gmail.com")) {
        res.send("Enter Valid Email")
        return;
    }

    try {
        const result = await userCollection.findOne(
            { email: userData.email }
        )
        if (!result) {
            res.status(500).send("User Not Found")
            return;
        }

        const nanoid = customAlphabet('1234567890', 6)
        const OTP = nanoid()
        console.log("OTP", OTP);

        /// TODO EMAIL SEND
        let config = {
            service: 'gmail',
            auth: {
                user: "madilsmit6@gmail.com",
                pass: "aatn xmkd uxkc ywgn"
            }
        }

        let transporter = nodemailer.createTransport(config);

        let Maingenerator = new mailgen({
            theme: 'default',
            product: {
                name: "Mailgen",
                link: "https://mailgen.js/"
            }
        })


        let response = {
            body: {
                name: `Hey ${userData.email} Here is you OTP CODE: ${OTP}`
            }
        }
        let mail = Maingenerator.generate(response)

        let message = {
            from: "madilsmit6@gmail.com",
            to: userData.email,
            subject: "Forget Password Your Account",
            html: mail
        }

        transporter.sendMail(message).then((info) => {
            console.log("you should Recive Email");
        }).catch((e) => {
            console.log(e);
        })

        const hashOTP = await stringToHash(OTP);
        let insertUser = await otpCollection.insertOne(
            {
                otp: hashOTP,
                email: userData.email,
                createdAt: new Date().getTime(),
            }
        )
        res.send({
            message: "OTP send Success Check Your Mail Box",
        })

    }
    catch (e) {
        console.log("error", e);
        res.status(500).send({
            message: e.error
        })
    }

}


export const ForgetVerifyHandler = async (req, res) => {

    if (!req.body.email || !req.body.otp || !req.body.newPassword) {
        res.status(400).send(`
          required parameter is missing
        `)
        return;
    }

    let userData = req.body
    console.log(userData);
    userData.email = userData.email.toLowerCase()

    if (!userData.email.endsWith("@gmail.com")) {
        res.send("Enter Valid Email")
        return;
    }

    try {
        const otpResult = await otpCollection.findOne(
            { email: userData.email },
            { sort: { _id: -1 } }
        )

        if (!otpResult) {
            res.status(500).send(
                {
                    message: "OTP INCORRECT"
                }
            )
            return;
        }

        const verifyOTPHash = await verifyHash(userData.otp, otpResult.otp)

        if (!verifyOTPHash) {
            res.status(500).send("OTP INCORRECT")
            return;
        }
        const newHash = await stringToHash(userData.newPassword)
        let updatePassword = await userCollection.updateOne(
            { email: userData.email },
            {
                $set: { password: newHash }
            }
        )

        console.log(updatePassword);
        res.send({
            message: "Password Update SuccesFUlly",
        })

    }
    catch (e) {
        console.log("error", e);
        res.status(500).send({
            message: e.error
        })
    }

}
