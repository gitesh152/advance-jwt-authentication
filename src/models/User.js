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

/** Unique index on email */
/** Index collation on email -> abc@email.com and Abc@email.com will not seperate document */
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

/** Intance method (work on document) for comparing password */
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(String(password || ''), this.passwordHash);
};

/** static method (work on collection (model)) for hashing password */
UserSchema.statics.hashPassword = function (password) {
  const saltRounds = 12;
  return bcrypt.hash(String(password || ''), saltRounds);
};

/** DB level email validation (also doing app level validation using Joi) */
UserSchema.path('email').validate(
  (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  'Invalid email',
);

const User = mongoose.model('User', UserSchema);

export default User;
