const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");

// POST route to add a review to a listing
router.post("/:id/reviews", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return res.status(404).send("Listing not found");
  }

  const newReview = new Review(req.body.review);
  newReview.author=req.user._id;
  console.log(newReview);
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));

// DELETE route to remove a review
router.delete("/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).send("Listing not found");
  }

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  const deletedReview = await Review.findByIdAndDelete(reviewId);

  if (!deletedReview) {
    return res.status(404).send("Review not found");
  }

  res.redirect(`/listings/${id}`);
}));

module.exports = router;
