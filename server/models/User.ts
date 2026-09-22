import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function(v: string) {
          // Password must contain at least:
          // - 8 characters minimum
          // - 1 uppercase letter
          // - 1 lowercase letter
          // - 1 number
          // - 1 special character
          const hasUpperCase = /[A-Z]/.test(v);
          const hasLowerCase = /[a-z]/.test(v);
          const hasNumber = /[0-9]/.test(v);
          const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(v);
          
          return hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
        },
        message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
      }
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster email lookups
UserSchema.index({ email: 1 });
// Index for role-based queries
UserSchema.index({ role: 1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
