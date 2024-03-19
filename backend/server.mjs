import express from 'express'
import path from 'path'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
const __dirname = path.resolve()

const app = express()

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}))
app.use(express.json()) //body parser
app.use(cookieParser())


import AuthRouter from './router/authentication.mjs'
import ProtectProfile from './router/profile.mjs'



app.use("/api/v1", AuthRouter)

app.use((req, res, next) => {
    const token = req.cookies.token
    // console.log("mil raha he bhaya", token);
    try {
        const decoded = jwt.verify(token, 'shhhhh');
        // console.log("decoded: ", decoded);
        req.currentUser = {
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            email: decoded.email,
            _id: decoded._id,
        };
        next();
    } catch (err) {
        res.status(401).send("Invalid Token")
        return;
    }

})


app.use("/api/v1", ProtectProfile)

app.get('/ping', (req, res) => {
    res.send(req.currentUser);
})

app.use("/static", express.static(path.join(__dirname, 'static')))

app.use(express.static(path.join(__dirname, 'public')))

const port = 5001
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})