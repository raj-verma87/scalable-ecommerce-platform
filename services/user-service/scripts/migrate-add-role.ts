import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from '../src/models/user.model';

config();

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );

    console.log(`Updated ${result.modifiedCount} users`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

runMigration();
