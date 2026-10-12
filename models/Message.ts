import { Schema, models, model } from "mongoose";

const messageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ["contact", "custom_request"],
      default: "contact",
    },
    artworkType: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: null,
    },
    referenceImage: {
      type: String,
      default: null,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    repliedSubject: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

if (models.Message) {
  delete (models as Record<string, unknown>).Message;
}

const Message = model("Message", messageSchema);

export default Message;
