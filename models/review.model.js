const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      require: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      require: [true, "Please provide your review title"],
      maxLength: [100, "title cannot be exceed more than 100 words"],
    },
    comment: {
      type: String,
      require: [true, "Please provide your review description"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: result[0]?.averageRating || 0,
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

reviewSchema.post("save", async function () {
  await Review.calculateAverageRating(this.product);
});
reviewSchema.post("deleteOne", async function (doc) {
  const productId = doc.product;
  await Review.calculateAverageRating(productId);
});

const Review = mongoose.model("review", reviewSchema);
module.exports = Review;
