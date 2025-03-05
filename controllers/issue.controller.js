import Issue from "../models/issue.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const createIssue = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;
    const createdBy = req.user._id;
    console.log("createdBy", createdBy);

    if (!title || !description) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const issue = new Issue({
      title,
      description,
      assignedTo: assignedTo || null,
      createdBy,
    });

    await issue.save();
    return res
      .status(201)
      .json({ message: "Issue created successfully", issue });
  } catch (error) {
    console.log("error in create Issue controller", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const assignIssue = async (req, res) => {
  try {
    const { issueId, technicianId } = req.body;

    // Find the issue
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // Ensure the issue is not already assigned (optional: remove this if reassigning is allowed)
    if (issue.assignedTo) {
      return res.status(400).json({
        message: "This issue is already assigned to a technician",
      });
    }

    // Find the technician and ensure they are not an admin
    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== "technician") {
      return res
        .status(400)
        .json({ message: "Invalid technician ID or technician not found" });
    }

    // Assign the issue to the technician
    issue.assignedTo = technicianId;
    await issue.save();

    // Populate assignedTo field to get technician details
    const updatedIssue = await Issue.findById(issueId).populate(
      "assignedTo",
      "name email role profileImg"
    );

    return res
      .status(200)
      .json({ message: "Issue assigned successfully", issue: updatedIssue });
  } catch (error) {
    console.error("Error in assignIssue:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteIssue = async (req, res) => {
  const { issueId } = req.params;
  try {
    const issue = await Issue.findByIdAndDelete(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    return res.status(200).json({ message: "Issue deleted successfully!" });
  } catch (error) {
    console.log("error in delete issue controller", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateIssue = async (req, res) => {
  const { issueId } = req.params;
  const { title, description, status } = req.body;
  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    //  updating the fields
    issue.title = title || issue.title;
    issue.status = status || issue.status;
    issue.description = description || issue.description;

    await issue.save();

    return res.status(200).json(issue);
  } catch (error) {
    console.log("error in update issue controller", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find();
    if (!issues) return res.status(200).json({});
    return res.status(200).json(issues);
  } catch (error) {
    console.log("error in getAll issues controller", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Get issues by status (Admin & Technician)
export const getIssuesByStatus = async (req, res) => {
  try {
    const { status } = req.query; // Get status from query params

    // Ensure a valid status is provided
    const validStatuses = ["open", "closed", "in progress"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    let issues;

    if (req.user.role === "admin") {
      // Admin can view all issues with the given status
      issues = await Issue.find({ status }).populate(
        "assignedTo",
        "name email"
      );
    } else {
      // Technicians can only see issues assigned to them with the given status
      issues = await Issue.find({ status, assignedTo: req.user.id });
    }

    return res.status(200).json({ count: issues.length, issues });
  } catch (error) {
    console.error("Error in getIssuesByStatus:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// get single ID
export const getSingleIssue = async (req, res) => {
  const { issueId } = req.params;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ message: "Invalid issue ID format" });
    }

    // Fetch issue and populate the assignedTo field with technician details
    const issue = await Issue.findById(issueId).populate(
      "assignedTo",
      "name email role profileImg"
    );

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    return res.status(200).json(issue);
  } catch (error) {
    console.error("Error in getSingleIssue controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// get only 5 latest issues

export const getLatestIssues = async (req, res) => {
  try {
    // Fetch latest 5 issues and populate assignedTo details
    const issues = await Issue.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("assignedTo", "name email profileImg role"); // 👈 Fetch only necessary fields

    if (!issues.length) {
      return res.status(200).json({ message: "No issues found", issues: [] });
    }

    return res.status(200).json(issues);
  } catch (error) {
    console.error("Error fetching latest issues:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
