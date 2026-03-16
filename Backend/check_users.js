const mongoose = require("mongoose");
const User = require("./models/User");
const Department = require("./models/Department");
const fs = require("fs");
require("dotenv").config();

async function checkUsers() {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);

        let output = "Connected to MongoDB\n\n";

        const users = await User.find({ role: { $in: ["professor", "hod"] } })
            .select("name email role departmentId")
            .populate("departmentId", "name");

        output += "Professors and HODs:\n";
        if (users.length === 0) {
            output += "No professors or HODs found.\n";
        }
        users.forEach(user => {
            output += `Name: ${user.name}, Role: ${user.role}, Email: ${user.email}, Dept: ${user.departmentId ? user.departmentId.name : "NONE"} (${user.departmentId ? user.departmentId._id : "N/A"})\n`;
        });

        const departments = await Department.find({});
        output += "\nDepartments:\n";
        departments.forEach(dept => {
            output += `Name: ${dept.name}, ID: ${dept._id}\n`;
        });

        fs.writeFileSync("user_data_dump.txt", output);
        console.log("Data written to user_data_dump.txt");

    } catch (err) {
        console.error("Error:", err);
        fs.writeFileSync("user_data_dump.txt", `Error: ${err.message}`);
    } finally {
        mongoose.disconnect();
    }
}

checkUsers();
