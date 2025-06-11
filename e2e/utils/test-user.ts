import { User } from "@schema/users";
import { createTestContext } from "./test-utils";

export async function createTestUser({ email }: { email: string }): Promise<User> {
    const { db } = createTestContext();
    
    const user = await db
        .insert(userTable)
        .values({
            email,
            name: "Test User",
            created_at: new Date(),
            updated_at: new Date(),
        })
        .returning();

    return user[0];
}
