import asynchandler from "../utils/asynchandler.js";
import Comment from "../models/comment.model.js";

const getVideoComments = asynchandler(async (req, res) => {
    const videoId = req.params.videoId; 
    const comments = await Comment.find({ video: videoId }).populate("owner", "username avatar");
    res.status(200).json({ success: true, data: comments });
});

const addComment = asynchandler(async (req, res) => {
    const videoId = req.params.videoId;
    const { content } = req.body;
    const ownerId = req.user._id;   
    const newComment = new Comment({
        content,
        owner: ownerId,
        video: videoId
    });
    await newComment.save();
    res.status(201).json({ success: true, data: newComment });
});

const updateComment = asynchandler(async (req, res) => {
    const commentId = req.params.commentId;
    const { content } = req.body;
    const comment = await Comment   .findById(commentId);
    if (!comment) {
        return res.status(404).json({ success: false, message: "Comment not found" });
    }   
    const updatedComment = await Comment.findByIdAndUpdate(commentId, { content }, { new: true });
    res.status(200).json({ success: true, data: updatedComment });
}); 

const deleteComment = asynchandler(async (req, res) => {    
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).json({ success: false, message: "Comment not found" });
    }   
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ success: true, message: "Comment deleted successfully" });
});

export { getVideoComments, addComment, updateComment, deleteComment };