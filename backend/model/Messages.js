import mongoose from "mongoose";

const MessageModelSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    content: {
      type: String,
      trim: true,
    },

    msgimage: {
      type: String,
    },

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
      required: true,
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("messages", MessageModelSchema);
export default MessageModel;