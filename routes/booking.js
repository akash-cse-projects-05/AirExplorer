// // routes/bookings.js
const express = require("express");
const router = express.Router(); // ✅ You need this to use `router`

const Booking = require("../models/booking"); // Your Booking model
const Listing = require("../models/listing"); // Import Listing model at the top
router.post("/", async (req, res) => {
  try {
    const { user, listing, checkIn, checkOut, guestCount, totalPrice } = req.body;

    // Validate required fields
    if (!user || !listing || !checkIn || !checkOut || !guestCount || !totalPrice) {
      req.flash("error", "All fields are required.");
      return res.redirect("back");
    }

    const newBooking = new Booking({
      user,
      listing,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guestCount: parseInt(guestCount),
      totalPrice: parseFloat(totalPrice)
    });

    await newBooking.save();

    // Redirect to the success page with booking ID
    res.redirect(`/bookings/success/${newBooking._id}`);

  } catch (err) {
    console.error("Booking error:", err);
    req.flash("error", "Booking failed. Please try again.");
    res.redirect("back");
  }
});


// router.get("/success", (req, res) => {
//   res.render("bookings/success");
// });

router.get("/success/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing").populate("user");

    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/listings");
    }

    res.render("bookings/success", { booking });
  } catch (err) {
    console.error("Success page error:", err);
    req.flash("error", "Failed to load booking details.");
    res.redirect("/listings");
  }
});

module.exports = router; // ✅ important!