import mongoose, { Schema, Document } from "mongoose";

export interface UserI extends Document {
  email: string;
  password?: string;
  resetPasswordToken?: string;
  subscriptions: Array<Schema.Types.ObjectId>;
  seenResources: Array<Schema.Types.ObjectId>;
}

const userSchema = new Schema<UserI>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  resetPasswordToken: { type: String, required: false },
  subscriptions: { type: [Schema.Types.ObjectId], required: false, unique: false },
  seenResources: { type: [Schema.Types.ObjectId], required: false, unique: false }, 
}, {
  timestamps: true
});



export default mongoose.model<UserI>("User", userSchema);
