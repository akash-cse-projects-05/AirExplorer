const mongoose = require("mongoose");
const initData = require("./data"); // Your data file
const Listing = require("../models/listing"); // Your Mongoose model for Listing

// Local MongoDB Connection URL (for MongoDB Compass)
// MongoDB Atlas connection string
const MONGO_URL = "mongodb+srv://akproject2223_db_user:Zx5ucu1sfDckJdq8@cluster0.djl1t9j.mongodb.net/TRAVAL?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB Atlas successfully!"))
.catch((err) => console.error("MongoDB connection error:", err));


// Connect to MongoDB (Local)
async function main() {
    try {
        await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        });
        console.log("Connected to MongoDB (Local Compass)");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

// Initialize the database
const initDB = async () => {
    try {
        // Delete all existing data
        await Listing.deleteMany({});
        console.log("Existing data cleared.");

        // Update data with the correct owner ObjectId
        initData.data = initData.data.map((obj) => ({
            ...obj,
            owner: new mongoose.Types.ObjectId("68176dd6b07532ec8cded29b"), // Convert owner to ObjectId
        }));

        // Insert updated data into the database
        await Listing.insertMany(initData.data);
        console.log("The data was initialized.");
    } catch (err) {
        console.error("Error initializing the database:", err);
    }
};

// Run the script
main()
    .then(() => initDB())
    .catch((err) => console.error("Connection failed:", err));
