import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_COMMERCE_API_URL,
  DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  DEFAULT_SUPABASE_URL,
} from "./config";

test("does not bind a fork to another deployment's commerce API", () => {
  assert.equal(DEFAULT_COMMERCE_API_URL, "");
});

test("does not ship another project's Supabase configuration", () => {
  assert.equal(DEFAULT_SUPABASE_URL, "");
  assert.equal(DEFAULT_SUPABASE_PUBLISHABLE_KEY, "");
});
