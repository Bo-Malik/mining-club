// Auto-create missing database tables on server startup
// This ensures production deployments don't fail due to missing tables

import { pool } from "./db";

export async function ensureTablesExist() {
  const client = await pool.connect();
  try {
    console.log("Ensuring all database tables exist...");

    // Stripe settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "stripe_settings" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "is_enabled" boolean NOT NULL DEFAULT false,
        "mode" text NOT NULL DEFAULT 'test',
        "test_publishable_key" text,
        "test_secret_key" text,
        "test_webhook_secret" text,
        "live_publishable_key" text,
        "live_secret_key" text,
        "live_webhook_secret" text,
        "currency" text NOT NULL DEFAULT 'usd',
        "allowed_payment_methods" jsonb DEFAULT '["card"]',
        "min_payment_amount" real NOT NULL DEFAULT 5,
        "max_payment_amount" real NOT NULL DEFAULT 10000,
        "webhook_url" text,
        "updated_at" timestamp DEFAULT now(),
        "updated_by" varchar
      );
    `);

    // Stripe customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "stripe_customers" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL REFERENCES "users"("id") UNIQUE,
        "stripe_customer_id" text NOT NULL UNIQUE,
        "email" text,
        "name" text,
        "metadata" jsonb,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // Stripe payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "stripe_payments" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL REFERENCES "users"("id"),
        "order_id" varchar,
        "stripe_payment_intent_id" text UNIQUE,
        "stripe_customer_id" text,
        "amount" real NOT NULL,
        "currency" text NOT NULL DEFAULT 'usd',
        "status" text NOT NULL DEFAULT 'pending',
        "product_type" text NOT NULL,
        "product_id" varchar,
        "product_name" text,
        "metadata" jsonb,
        "receipt_url" text,
        "failure_reason" text,
        "refunded_amount" real,
        "refunded_at" timestamp,
        "completed_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp
      );
    `);

    // Articles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "articles" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" text NOT NULL,
        "description" text NOT NULL,
        "category" text DEFAULT 'Basics',
        "icon" text,
        "image" text,
        "order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp
      );
    `);

    // App config table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "app_config" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "key" text NOT NULL UNIQUE,
        "value" text NOT NULL,
        "category" text DEFAULT 'general',
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp
      );
    `);

    // User security table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user_security" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL REFERENCES "users"("id") UNIQUE,
        "pin_hash" text,
        "biometric_enabled" boolean NOT NULL DEFAULT false,
        "biometric_key_id" text,
        "failed_attempts" integer NOT NULL DEFAULT 0,
        "locked_until" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp
      );
    `);

    // Recurring balances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "recurring_balances" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL REFERENCES "users"("id"),
        "symbol" text NOT NULL,
        "daily_amount" real NOT NULL DEFAULT 0,
        "source" text NOT NULL DEFAULT 'mining',
        "source_id" varchar,
        "is_active" boolean NOT NULL DEFAULT true,
        "started_at" timestamp DEFAULT now(),
        "expires_at" timestamp,
        "last_credited_at" timestamp,
        "total_credited" real NOT NULL DEFAULT 0
      );
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL REFERENCES "users"("id"),
        "type" text NOT NULL,
        "product_id" varchar,
        "product_name" text,
        "amount" real NOT NULL,
        "currency" text NOT NULL DEFAULT 'USDT',
        "status" text NOT NULL DEFAULT 'pending',
        "payment_method" text,
        "tx_hash" text,
        "details" jsonb,
        "created_at" timestamp DEFAULT now(),
        "completed_at" timestamp
      );
    `);

    // Feedback rewards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "feedback_rewards" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL,
        "platform" text,
        "claimed_at" timestamp DEFAULT now(),
        "reward_amount" real DEFAULT 20,
        "hashrate_ths" real DEFAULT 0.8,
        "expiry_date" timestamp,
        "status" text DEFAULT 'claimed'
      );
    `);

    // Referrals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "referrals" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "referrer_id" varchar NOT NULL REFERENCES "users"("id"),
        "referred_id" varchar NOT NULL REFERENCES "users"("id"),
        "status" text NOT NULL DEFAULT 'pending',
        "reward_amount" real,
        "created_at" timestamp DEFAULT now(),
        "completed_at" timestamp
      );
    `);

    // Referral payouts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "referral_payouts" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "referral_id" varchar NOT NULL,
        "referrer_id" varchar NOT NULL REFERENCES "users"("id"),
        "amount" real NOT NULL,
        "currency" text NOT NULL DEFAULT 'USDT',
        "payout_type" text NOT NULL DEFAULT 'commission',
        "status" text NOT NULL DEFAULT 'pending',
        "created_at" timestamp DEFAULT now(),
        "paid_at" timestamp
      );
    `);

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "description" text,
        "type" text NOT NULL,
        "price" real NOT NULL,
        "currency" text NOT NULL DEFAULT 'USDT',
        "details" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "order" integer NOT NULL DEFAULT 0,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp
      );
    `);

    console.log("✓ All database tables verified/created");
  } catch (error) {
    console.error("Error ensuring tables exist:", error);
    // Don't crash the server - some tables may fail if they already exist with different constraints
  } finally {
    client.release();
  }
}
