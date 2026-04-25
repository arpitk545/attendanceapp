require("dotenv").config();

const express = require("express");
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const database =require('./config/database');
const authRoutes =require('./routes/Auth');
const attendanceRoutes =require("./routes/attendance");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});


const PORT = process.env.PORT || 4000;
dotenv.config();
database.connect();

const allowedOrigins = [
  "http://localhost:3000",
  "https://gecaiml.vercel.app",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/attendance",attendanceRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
