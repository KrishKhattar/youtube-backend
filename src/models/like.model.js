import mongoose, { Schema } from "mongoose";

const likeSchema = mongoose.Schema(
  {
    comment: {
      type: Schema.Types.ObjectId,
      required: "Comment",
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Videos",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Like = mongoose.model("Like", likeSchema);
