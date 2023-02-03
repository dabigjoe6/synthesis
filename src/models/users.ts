import mongoose from "mongoose";

export interface UserI extends mongoose.Document {
  email: string;
  password?: string;
  resetPasswordToken?: string;
  subscriptions: Array<mongoose.Schema.Types.ObjectId>;
  seenResources: Array<mongoose.Schema.Types.ObjectId>;
}

const userSchema = new mongoose.Schema<UserI>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  resetPasswordToken: { type: String, required: false },
  subscriptions: { type: [mongoose.Schema.Types.ObjectId], required: false, unique: false },
  seenResources: { type: [mongoose.Schema.Types.ObjectId], required: false, unique: false },
}, {
  timestamps: true
});



export default mongoose.model<UserI>("User", userSchema);
