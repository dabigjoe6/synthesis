import mongoose from "mongoose";

export enum WeekDays {
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
};

export enum FrequencyType {
  "daily",
  "weekly",
}

export interface FrequencyI extends mongoose.Document {
  frequencyType: string;
  days?: Array<WeekDays>;
  time: Array<string>;
  timeZone: string;
}

const frequencySchema = new mongoose.Schema<FrequencyI>({
  frequencyType: { type: String, required: true, enum: FrequencyType, default: "daily" },
  days: { type: [mongoose.Schema.Types.String], required: false, default: ["mon"] },
  time: { type: [mongoose.Schema.Types.String], required: true, default: ["08:00"] },
  timeZone: { type: String, required: true, default: "Europe/London" }
})

interface SettingsI extends mongoose.Document {
  isDigestPaused: boolean,
  isSummaryEnabled: boolean,
  frequency: FrequencyI
}

const settingsSchema = new mongoose.Schema<SettingsI>({
  isDigestPaused: { type: Boolean, required: false, default: false },
  isSummaryEnabled: { type: Boolean, required: false, default: true },
  frequency: { type: frequencySchema, required: false }
});

export interface UserI {
  _id: string;
  email: string;
  password?: string;
  resetPasswordToken?: string;
  resetPasswordTokenCreatedAt?: number;
  subscriptions: Array<mongoose.Schema.Types.ObjectId>;
  seenResources: Array<mongoose.Schema.Types.ObjectId>;
  settings?: SettingsI
}


export type UserMongooseI = UserI & mongoose.Document;

const userSchema = new mongoose.Schema<UserMongooseI>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  resetPasswordToken: { type: String, required: false },
  resetPasswordTokenCreatedAt: { type: Date, required: false },
  subscriptions: { type: [mongoose.Schema.Types.ObjectId], required: false, unique: false },
  seenResources: { type: [mongoose.Schema.Types.ObjectId], required: false, unique: false },
  settings: { type: settingsSchema, required: false }
}, {
  timestamps: true
});



export default mongoose.model<UserMongooseI>("User", userSchema);
