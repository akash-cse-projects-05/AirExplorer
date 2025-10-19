const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError"); 
const Listing = require("../models/listing"); // Adjust the path if needed
const flash=require("connect-flash");
const bcrypt = require("bcrypt"); 
const passport=require("passport");
const LocalStrategy=require("passport-local");
const { isLoggedIn }=require("../utils/middleware.js");
const mongoose = require("mongoose");


// Index route to show all listings
router.get("/", async (req, res) => {
  const userId = req.params.id;
  try {
    const allListingsFromDB = await Listing.find({}); // Optionally filter listings based on userId

    const allListingsWithCategory = allListingsFromDB.map(listing => {
      let category;
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

    res.render("listings/index", { allListings: allListingsWithCategory, userId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching listings");
  }
});

//new route for addign the listing

router.get("/new", (req, res) => {
  console.log(req.user)
  if (!req.isAuthenticated()) {
      console.log("error", "You must be logged in to access this page.");
      return res.redirect("/users/login"); // Redirect to login page
  }
  res.render("listings/new");
});

  // Show route to display a specific listing with reviews
  router.get("/:id", async (req, res) => {
    let { id } = req.params;
    try {
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" }  // Populate author inside reviews
            })
            .populate("owner"); // Populate owner separately

        if (!listing) {
            return res.status(404).send("Listing not found");
        }

        console.log("Listing Data:", listing);
        console.log("Reviews Data:", listing.reviews);

        res.render("listings/show", { 
            listing, 
            currentUser: req.user
        });
    } catch (err) {
        console.error("Error fetching listing details:", err);
        res.status(500).send("Error fetching listing details");
    }
});



//user route 
router.get("/userinfo", isLoggedIn, async (req, res) => {
  try {
      // Check if the user object and _id exist
      if (!req.user || !req.user._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
          console.error("Invalid user ID:", req.user ? req.user._id : "No user");
          return res.status(400).send("Invalid user ID");
      }

      console.log("Current Logged-in User ID:", req.user._id);

      // Fetch listings where the owner is the logged-in user
      const userListings = await Listing.find({ owner: req.user._id });

      console.log("User Listings:", userListings);

      // Render userinfo.ejs with the user's listings
      res.render("listings/userinfo", { allListings: userListings, currentUser: req.user });

  } catch (error) {
      console.error("Error fetching user listings:", error);
      res.status(500).send("Error fetching your listings");
  }
});


  // Create route to save a new listing (POST request)
  router.post("/",isLoggedIn, wrapAsync(async (req, res) => {
   
      let listingData = req.body.listing; // Getting the listing data from the form submission
      if (!listingData) {
        return res.status(400).send("Listing data is missing");
      }
  
      // Create a new listing using the Listing model
      const newListing = new Listing(listingData);
      newListing.owner=req.user._id;
     
      // Save the new listing to the database
      await newListing.save();
      
      req.flash("success","New Listing created");
      // Redirect to the listings page after successful creation
      res.redirect("/listings?message=Listing%20has%20been%20saved");
    } 
  ));
  
  
  
  //edit route
  router.get("/:id/edit", isLoggedIn, async (req, res) => {
      const { id } = req.params;
      try {
          const listing = await Listing.findById(id);
          if (!listing) {
              req.flash("error", "Listing not found");
              return res.redirect("/listings");
          }
          
          // Check if the current user owns this listing
          if (!listing.owner || listing.owner.toString() !== req.user._id.toString()) {
              req.flash("error", "You don't have permission to edit this listing");
              return res.redirect("/listings");
          }
          
          res.render("listings/edit", { listing });
      } catch (err) {
          console.log(err);
          req.flash("error", "Error fetching listing for editing");
          res.redirect("/listings");
      }
  });
  
  //update route
  router.put("/:id", isLoggedIn, async (req, res) => {
      const { id } = req.params;
      try {
          const listing = await Listing.findById(id);
          if (!listing) {
              req.flash("error", "Listing not found");
              return res.redirect("/listings");
          }
          
          // Check if the current user owns this listing
          if (!listing.owner || listing.owner.toString() !== req.user._id.toString()) {
              req.flash("error", "You don't have permission to update this listing");
              return res.redirect("/listings");
          }
          
          await Listing.findByIdAndUpdate(id, {...req.body.listing});
          req.flash("success", "Listing updated successfully!");
          res.redirect("/listings");
      } catch (err) {
          console.log(err);
          req.flash("error", "Error updating listing");
          res.redirect("/listings");
      }
  });
  
  //delete route 
  router.delete("/:id",isLoggedIn,async (req,res)=>{
      let{id}=req.params;
      let deletedListing=await Listing.findByIdAndDelete(id);
      console.log(deletedListing);
      res.redirect("/listings");
  });

//route to get the owner added listings
router.get("/added", async (req, res) => {
  try {
    const allListings = await Listing.find({}); // Fetch listings

    // 🔍 Debugging: Log all listings before rendering
    console.log("Fetched Listings:", allListings);

    res.render("listings/added", { allListings }); // Render template
  } catch (error) {
    console.error("Error fetching listing details:", error);
    res.status(500).send("Error fetching listings");
  }
});


module.exports=router;









