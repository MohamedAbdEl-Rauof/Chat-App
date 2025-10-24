import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  type: 'direct' | 'group';
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  lastActivity: Date;
}

const RoomSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true,
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
});

const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;

