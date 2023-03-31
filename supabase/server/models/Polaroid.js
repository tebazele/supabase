import mongoose from 'mongoose'
const Schema = mongoose.Schema

export const PolaroidSchema = new Schema(
  {
    title: { type: String, required: true },
    imgUrl: { type: String, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true }
  },
  { timestamps: true, toJSON: { virtuals: true } }
)


PolaroidSchema.virtual('creator', {
  localField: 'creatorId',
  foreignField: '_id',
  justOne: true,
  ref: 'Account'
})
