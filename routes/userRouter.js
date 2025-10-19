const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const { isLoggedIn } = require("../utils/middleware.js");


router.get("/signup", (req, res) => {
  res.render("users/signup");

  
  });
  
  router.get("/login", (req, res) => {
    res.render("users/login");

  });
  
  router.post("/login", passport.authenticate("local", { failureRedirect: "/users/login" }), async (req, res) => {
    req.flash("success", "Successfully logged in!");
    
    res.redirect(`/listings/`); // Use backticks for template literals
    // Redirect to the listings page on successful login
  });
  
  
  
  
  router.post("/signup", async (req, res) => {
      try {
          let { username, email, password } = req.body;
          
          const newUser = new User({ username, email });
          const registeredUser=await User.register(newUser, password);
  console.log(registeredUser)
  req.login(registeredUser,(err)=>{
    if(err){
        return next(err);
    }
  })
          // Log the user in after successful registration
          passport.authenticate("local")(req, res, () => {
              req.flash("success", "User was successfully registered");
              res.redirect("/listings");
              console.log(newUser)
          });
      } catch (err) {
          console.error(err);
          req.flash("error", "Something went wrong. Please try again.");
          res.redirect("/users/signup");
      }
  });
  
  //logout route
  router.get("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "You have been logged out successfully!");
      res.redirect("/listings");
    });
  });

  router.get("/profile", isLoggedIn, async (req, res) => {
    try {
      // All bookings made by the logged-in user
      const bookings = await Booking.find({ user: req.user._id }).populate("listing");

      // Group bookings by listing
      const groupedBookings = {};
      bookings.forEach(booking => {
        const listingId = booking.listing._id.toString();
        if (!groupedBookings[listingId]) {
          groupedBookings[listingId] = {
            listing: booking.listing,
            bookings: []
          };
        }
        groupedBookings[listingId].bookings.push(booking);
      });

      // All listings created by the user
      const userListings = await Listing.find({ owner: req.user._id });

      res.render("users/profile", { 
        currentUser: req.user, 
        bookedListings: bookings, 
        groupedBookings: groupedBookings,
        userListings 
      });
    } catch (err) {
      console.error("Error loading profile:", err);
      req.flash("error", "Failed to load profile. Please try again.");
      res.redirect("/listings");
    }
  });
  
// Using imported isLoggedIn middleware from utils/middleware.js


module.exports = router;
