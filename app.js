const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

// Models
const Listing = require("./models/listing");
const Review = require("./models/review");
const User = require("./models/user");

// Routers
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/userRouter");
const bookingRouter = require("./routes/booking");


// MongoDB Atlas connection string
const MONGO_URL = "mongodb+srv://akproject2223_db_user:Zx5ucu1sfDckJdq8@cluster0.djl1t9j.mongodb.net/TRAVAL?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB Atlas successfully!"))
.catch((err) => console.error("MongoDB connection error:", err));


// // MongoDB Connection
// const MONGO_URL = "mongodb://127.0.0.1:27017/TRAVAL";

async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => console.log("Connected to the DB"))
  .catch((err) => console.log(err));

// View Engine Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware Setup
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash & Current User Middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.get("/", async (req, res) => {
  try {
    const allListingsFromDB = await Listing.find({});

    const allListingsWithCategory = allListingsFromDB.map(listing => {
      let category;
      // Logic to determine the category based on listing properties
      // Adapt these conditions to match your actual listing data structure
      if (listing.amenities && listing.amenities.includes('Fireplace') && listing.location.includes('Mountain')) {
        category = 'mountain';
      } else if (listing.amenities && listing.amenities.includes('Pool')) {
        category = 'pool';
      }
       else if (listing.amenities && listing.amenities.includes('Kitchen') && listing.amenities.includes('Fireplace') && listing.amenities.includes('Pet-friendly'))
       {
        category = 'rooms';
       }
        else if (listing.location.toLowerCase().includes('new york') || listing.location.toLowerCase().includes('london') || listing.location.toLowerCase().includes('paris'))
       {
         category = 'cities';
       }
       else if (listing.title.toLowerCase().includes('castle'))
       {
        category = 'castles'
       }
       else if (listing.title.toLowerCase().includes('camp') || listing.amenities.includes('Campground')) {
          category = 'camping';
      } else if (listing.amenities && listing.amenities.includes('Farm')) {
          category = 'farms';
      } else if (listing.description.toLowerCase().includes('arctic') || listing.location.toLowerCase().includes('arctic')) {
          category = 'arctic';
      } else if (listing.title.toLowerCase().includes('dome')) {
          category = 'domes';
      } else if (listing.title.toLowerCase().includes('boat')) {
          category = 'boats';
      }
       else {
        category = 'trending'; // Default category
      }
      return { ...listing.toObject(), category }; // Add the category property
    });

    res.render("listings/home", { allListings: allListingsWithCategory });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching listings");
  }
});


app.use("/listings", listingRouter);
app.use("/listings", reviewRouter);
app.use("/users", userRouter);
app.use("/bookings", bookingRouter);

// Logout Route
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    console.log("You are logged out now");
    res.redirect("/");
  });
});

// Catch-all 404 Error Handler
// const ExpressError = require("./utils/ExpressError"); // Uncomment if needed
// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// });

// General Error Handler
// app.use((err, req, res, next) => {
//   const { statusCode = 500, message = "Something went wrong!" } = err;
//   res.status(statusCode).send(message);
// });

// Server Start
app.listen(3000, () => {
  console.log("The server is listening on port 3000");
});
