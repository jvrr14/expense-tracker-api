import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { users } from "../../db/schema.js";

export const getUserByEmail = async (email: string) => {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
};

export const createUser = async (name: string, email: string, passwordHash: string) => {
    const [user] = await db.insert(users)
        .values({ name, email, passwordHash })
        .returning({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt, updatedAt: users.updatedAt });

    return user;
};
