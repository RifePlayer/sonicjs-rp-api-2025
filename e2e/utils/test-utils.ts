import { drizzle } from "drizzle-orm/d1";
import { Database } from "@types/drizzle-orm";
import { db } from "@lib/db";

export function createTestContext(): { db: Database } {
    return { db: drizzle(db) };
}
