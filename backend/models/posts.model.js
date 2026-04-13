  import mongoose from "mongoose";
  

  const PostSchema = mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        body: {
            type:String,
            required:true
        },
        likedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        createdAt: {
            type:Date,
            default:Date.now
        },
        updatedAt: {
            type:Date,
            default:Date.now
        },
        media: {
            type:String,
            default: ''
        },
        active: {
            type:Boolean,
            default:true
        },
        fileType: {
            type:String,
            default: '' 
        },
  });


  const Post = mongoose.model("post",PostSchema)

  export default Post;