import argon2 from "argon2";

export async function hashPassword(password) {
    const hashed = await argon2.hash(password);
    return hashed
}

export async function verifyPassword(password, hashedPassword) {
    try {
        if (await argon2.verify(hashedPassword, password)) {
            return true;
        }
        else {
            return false;
        }
    } catch (error) {
        console.error(error)
        return false
    }
}