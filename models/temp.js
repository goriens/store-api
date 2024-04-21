import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    $match: {
      product: new ObjectId("6622e5779ebab0bd2d6c43ca"),
    },
  },
  {
    $group: {
      _id: null,
      averageRating: {
        $avg: "$rating",
      },
      numOfReviews: {
        $sum: 1,
      },
    },
  },
];

const client = await MongoClient.connect("mongodb://localhost:27017/");
const coll = client.db("ecommerceapi").collection("reviews");
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();
