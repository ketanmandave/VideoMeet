import { User } from "../models/userModel.js";
import httpStatus from "http-status";
import { Meeting } from "../models/meetingModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: "Username and password are required" });
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res
                .status(httpStatus.NOT_FOUND)
                .json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ message: "Invalid credentials" });
        }
        let token = crypto.randomBytes(20).toString("hex");
        user.token = token;
        await user.save();
        return res.status(httpStatus.OK).json({ token: token });
    } catch (error) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error" });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;
    try {
        const existinguser = await User.findOne({ username });
        if (existinguser) {
            return res
                .status(httpStatus.CONFLICT) // ✅ better than 302
                .json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, username, password: hashedPassword });
        await newUser.save();
        return res
            .status(httpStatus.CREATED)
            .json({ message: "User registered successfully" });
    } catch (error) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error" });
    }
};

const getUserHistory = async (req, res) => {
    const { token } = req.query;
    try {
        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const meetings = await Meeting.find({ user_id: user.username });
        return res.status(200).json(meetings);
    } catch (e) {
        console.error("Error in getUserHistory:", e);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;
    try {
        const user = await User.findOne({ token: token });
        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })
        await newMeeting.save();
        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}
export { login, register, getUserHistory, addToHistory };                                                                                                                                                                                         