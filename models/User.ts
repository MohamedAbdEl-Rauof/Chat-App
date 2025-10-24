import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export interface IUser extends Document {
  username: string;
  authToken: string;
  avatar?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  authToken: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.methods.generateAuthToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

