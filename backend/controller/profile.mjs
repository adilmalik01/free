import client from "../database/mongodb.mjs";
import { ObjectId } from "mongodb"

let db = client.db("VottingApp")
let userCollection = db.collection("openVoiceHubUser")



export const getProfile = async (req, res) => {

    try {
        let query = await userCollection.aggregate([
            {
                $match: { _id: new ObjectId(`${req.currentUser._id}`) }
            }, {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    createdAt: 1,
                }
            }
        ]).toArray()
        res.send(query)

    } catch (error) {
        console.log(error);
    }

    // console.log(req.currentUser._id);
}



export const updateUserProfile = async (req, res) => {
    const { firstName, lastName } = req.body;

    try {
        const result = await userCollection.updateOne(
            { _id: new ObjectId(req.currentUser._id) },
            { $set: { firstName: firstName, lastName: lastName } }
        );

        if (result.modifiedCount === 1) {
            res.status(200).send("Profile updated successfully");
        } else {
            res.status(500).send("Failed to update profile");
        }
    } catch (error) {
        console.log(error);
        res.statu0s(500).send("Internal server error");
    }
}



