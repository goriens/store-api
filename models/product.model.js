const Review = require("./review.model");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter product name"],
      maxLength: [60, "Product Name can not be more than 60 words"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Please enter product description"],
      maxLength: [800, "Description can not be more than 800 words"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please provide product company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: true,
    },
    featured: {
      type: Boolean,
      required: false,
    },
    freeShipping: {
      type: Boolean,
      default: true,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
productSchema.virtual("reviews", {
  ref: "review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  // match: { rating: 5 },
});
productSchema.pre("deleteOne", async function (next) {
  await Review.deleteMany({ product: this._id });
});

const Product = mongoose.model("product", productSchema);
module.exports = Product;
