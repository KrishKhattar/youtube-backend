import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query
    const filter = query ? { title: new RegExp(query, 'i') } : {}
    if (userId) filter.userId = userId

    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortType === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))

    const total = await Video.countDocuments(filter)

    res.status(200).json(new ApiResponse(videos, total, page, limit))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const { file } = req

    if (!file) throw new ApiError(400, 'No video file uploaded')

    // Ensure the user is authenticated and has a valid ID
    if (!req.user || !isValidObjectId(req.user._id)) {
        throw new ApiError(401, 'User not authenticated')
    }

    // Fetch the user from the database
    const user = await User.findById(req.user._id)
    if (!user) throw new ApiError(404, 'User not found')

    const uploadResult = await uploadOnCloudinary(file.path)
    const video = new Video({
        title,
        description,
        url: uploadResult.secure_url,
        userId: user._id // Associate the video with the user
    })

    await video.save()
    res.status(201).json(new ApiResponse(video))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) throw new ApiError(400, 'Invalid video ID')

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, 'Video not found')

    res.status(200).json(new ApiResponse(video))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description, thumbnail } = req.body

    if (!isValidObjectId(videoId)) throw new ApiError(400, 'Invalid video ID')

    const video = await Video.findByIdAndUpdate(videoId, { title, description, thumbnail }, { new: true })
    if (!video) throw new ApiError(404, 'Video not found')

    res.status(200).json(new ApiResponse(video))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) throw new ApiError(400, 'Invalid video ID')

    const video = await Video.findByIdAndDelete(videoId)
    if (!video) throw new ApiError(404, 'Video not found')

    res.status(200).json(new ApiResponse({ message: 'Video deleted successfully' }))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) throw new ApiError(400, 'Invalid video ID')

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, 'Video not found')

    video.isPublished = !video.isPublished
    await video.save()

    res.status(200).json(new ApiResponse(video))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
