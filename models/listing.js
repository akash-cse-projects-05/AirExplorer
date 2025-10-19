const mongoose=require("mongoose");
const Schema=mongoose.Schema;


const Review = require("./review");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:false,
    },
    images: [ { type: String, required: false} ],

    price:{
        type:Number,
        required:true,
    },
    location:{
        type:String,
        required:false,
    },
    city:{
      type:String,
      required:false,
    },
   status:{
    type:String,
    required:false,
   },
    
    amenities: [
        {
          type: String,
          required: false,
        }
      ],
    country:{
        type:String,
        required:true,
    },
    coordinates: {
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        }
    },
    category:{
        type:String,
        required:false,
    },
    reviews:[
        {
          type:Schema.Types.ObjectId,
          ref:"Review",
        },
      ],

      owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
      }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
   if(listing)
    {await Review.deleteMany({_id:{$in:listing.reviews}});
}
});

const Listing= mongoose.model("listing",listingSchema);
module.exports=Listing;





