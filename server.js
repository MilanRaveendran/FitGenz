const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= DATABASE ================= */
mongoose.connect("mongodb://127.0.0.1:27017/fitgenzz")
.then(() => console.log("Database connected"))
.catch(err => console.log(err));

/* ================= SCHEMAS ================= */

// USER MODEL
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const User = mongoose.model("User", UserSchema);

// RECORD MODEL
const RecordSchema = new mongoose.Schema({
    userId: String,
    type: String,
    data: Object,
    date: {
        type: Date,
        default: Date.now
    }
});

const Record = mongoose.model("Record", RecordSchema);


/* ================= ROUTES ================= */

// TEST
app.get("/", (req, res) => {
    res.send("FitGenz backend running 🚀");
});


// ✅ REGISTER
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ✅ LOGIN
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Wrong password" });
        }

        res.json({
            message: "Login successful",
            userId: user._id
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ✅ ADD RECORD
app.post("/add-record", async (req, res) => {
    try {
        const { userId, type, data } = req.body;

        const newRecord = new Record({
            userId,
            type,
            data
        });

        await newRecord.save();

        res.json({ message: "Record saved" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ✅ GET RECORDS
app.get("/records/:userId", async (req, res) => {
    try {
        const records = await Record.find({ userId: req.params.userId });
        res.json(records);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/* ================= SERVER ================= */

app.listen(5000, () => {
    console.log("Server running on port 5000");
});