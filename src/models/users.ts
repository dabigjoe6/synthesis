import mongoose from "mongoose";

export interface SettingsI extends mongoose.Document {
  isDigestPaused: boolean,
}

const settingsSchema = new mongoose.Schema<SettingsI>({
  isDigestPaused: { type: Boolean, required: false, default: false }
});


export interface UserI extends mongoose.Document {
  email: string;
  password?: string;
  resetPasswordToken?: string;
  subscriptions: Array<mongoose.Schema.Types.ObjectId>;
  seenResources: Array<mongoose.Schema.Types.ObjectId>;
  settings?: {
    isDigestPaused?: boolean;
  }
}

const userSchema = new mongoose.Schema<UserI>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  resetPasswordToken: { type: String, required: false },
  subscriptions: { type: [mongoose.Schema.Types.ObjectId], required: false, unique: false },
  seenResources: { type: [mongoose.Schema.Types.ObjectId], required: false, unique: false },
  settings: { type: settingsSchema, required: false }
}, {
  timestamps: true
});



export default mongoose.model<UserI>("User", userSchema);
