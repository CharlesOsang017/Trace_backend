import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/token.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    // checking if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    // checking password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password should be 6 or more characters" });
    }
    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const PROFILE_PICS = [
      "https://avatars.githubusercontent.com/u/76118931?v=4",
      "https://avatars.githubusercontent.com/u/77917845?v=4",
      "https://avatars.githubusercontent.com/u/75869731?v=4",
      "https://avatars.githubusercontent.com/u/24823972?v=4",
    ];
    const randomIndex = Math.floor(Math.random() * PROFILE_PICS.length);
    const profileImg = PROFILE_PICS[randomIndex]; // ✅ This stores the correct path

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profileImg,
    });
    await newUser.save();
    const { password: _, ...user } = newUser.toObject();

    // generate JWT token
    generateTokenAndSetCookie(newUser._id, res);

    return res.status(201).json(user);
  } catch (error) {
    console.log("error in registerUser controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password is correct
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateTokenAndSetCookie(user._id, res);

    // Remove password from user object before sending response
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Send response with user data and token
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Error logging in user:", error.message);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

// Logout user
export const logOutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "logged out successfully!" });
  } catch (error) {
    console.log("error logging out ", error.message);
  }
};

// getting the login user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// get all technicians
export const getAllTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: "technician" }).select(
      "-password"
    );
    return res.status(200).json(technicians);
  } catch (error) {
    console.log("Error in getAllTechnicians:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
