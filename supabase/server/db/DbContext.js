import mongoose from 'mongoose'
import { AccountSchema } from '../models/Account'
import { PolaroidSchema } from '../models/Polaroid.js';

class DbContext {
  Account = mongoose.model('Account', AccountSchema);
  Polaroids = mongoose.model('Polaroid', PolaroidSchema);
}

export const dbContext = new DbContext()
