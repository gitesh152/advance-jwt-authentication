/**
 * User: name, email, passwordHash
 */

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

/**
 * Unique index on email (case-insensitive).
 * Uses collation so `abc@email.com` and `Abc@email.com`
 * are treated as the same value.
 */
UserSchema.index(
  { email: 1 },
  {
    unique: 1,
    collation: {
      strength: 2,
      locale: 'en',
    },
  },
);

/**
 * Instance method (runs on a document) to compare a plain password
 * with the stored password hash.
 */
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(String(password || ''), this.passwordHash);
};

/** Static method (runs on the model) to hash a plain password */
UserSchema.statics.hashPassword = function (password) {
  const saltRounds = 12;
  return bcrypt.hash(String(password || ''), saltRounds);
};

/**
 * Schema-level email validation (basic format check).
 * Additional and stricter validation is handled at the application level using Joi.
 */
UserSchema.path('email').validate(
  (v) => typeof v === 'string' && v.length <= 254 && v.includes('@'),
  'Invalid email',
);

const User = mongoose.model('User', UserSchema);

export default User;
