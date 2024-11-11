import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import ApiError  from "../utils/ApiError.js";
import  ApiResponse  from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res, next) => {
  try {
    // Step 1: Extract the channel ID from the request parameters
    const channelId = req.params.channelId;

    // Step 2: Count the total number of videos for the channel
    const totalVideos = await Video.countDocuments({ channelId });

    // Step 3: Count the total number of subscribers for the channel
    const totalSubscribers = await Subscription.countDocuments({ channelId });

    // Step 4: Count the total number of likes for the channel
    const totalLikes = await Like.countDocuments({ channelId });

    // Step 5: Aggregate the total number of views for all videos of the channel
    const totalViews = await Video.aggregate([
      // Match videos by channel ID
      { $match: { channelId: mongoose.Types.ObjectId(channelId) } },
      // Group by null to sum up all views into a single total
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    // Step 6: Send the aggregated stats as a JSON response
    res.json(
      new ApiResponse({
        totalVideos,
        totalSubscribers,
        totalLikes,
        totalViews: totalViews[0]?.totalViews || 0, // Default to 0 if no views
      })
    );
  } catch (error) {
    // Handle any errors that occur during the process
    next(new ApiError(500, "Failed to retrieve channel statistics"));
  }
});

const getChannelVideos = asyncHandler(async (req, res, next) => {
  try {
    // Step 1: Extract the channel ID from the request parameters
    const channelId = req.params.channelId;

    // Step 2: Find all videos associated with the channel
    const videos = await Video.find({ channelId });

    // Step 3: Send the list of videos as a JSON response
    res.json(new ApiResponse(videos));
  } catch (error) {
    // Handle any errors that occur during the process
    next(new ApiError(500, "Failed to retrieve channel videos"));
  }
});

export { getChannelStats, getChannelVideos };
