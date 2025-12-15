/**
 * RefreshToken: user, tokenHash, revoked, createdAt, expiresAt, replacedByHash, ip, userAgent
 */

import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    revoked: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    replacedByHash: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  { timestamps: false },
);

/** Unique index on tokenHash */
RefreshTokenSchema.index({ tokenHash: 1 }, { unique: 1 });

/** TTL(time to live) index on expireAt -> automatically delete records*/
/** No need to set up cron job to delete records */
RefreshTokenSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
  },
);

/** Compound index on revoked and user -> fast query for active tokens */
RefreshTokenSchema.index({ user: 1, revoked: 1 }, {});

/** Virtuals for quick checks */

RefreshTokenSchema.virtual('isExpired').get(function () {
  return this.expiresAt && Date.now() >= this.expiresAt.getTime();
});

RefreshTokenSchema.virtual('isActive').get(function () {
  return !this.revoked && !this.isExpired;
});

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
export default RefreshToken;
