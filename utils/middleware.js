module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.user)
  if (req.isAuthenticated()) {
    return next(); // ✅ Proceed if the user is authenticated
  }
  console.log("error", "You must be logged in to access this page.");
  res.redirect("/users/login");
  // ❌ Redirect if not logged in
};


// module.export.isReviewAuthor=async(ReadableByteStreamController,res,next)=>{
//   let {reviewId}=req.params
//   let review=await review.findById(reviewId);
//   if(!review.author.equals(res.locals.currentUser._id)){
//     console.log("YOu are not teh owner of this review")
//     retunr
//   }
// }