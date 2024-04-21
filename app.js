require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./db/connect");

const authRouter = require("./routes/auth.routes");
const userRouter = require("./routes/user.routes");
const productRouter = require("./routes/product.routes");
const reviewRouter = require("./routes/review.routes");
const orderRouter = require("./routes/order.routes");

const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//security
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 50,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

// middleware
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static("./public"));
app.use(fileUpload());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

//error+notfound
app.use(notFound);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(PORT, console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};
start();
