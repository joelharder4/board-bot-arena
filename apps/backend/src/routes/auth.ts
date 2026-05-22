import express, { type Request, type Response } from 'express';
import { createAccountSchema, logInSchema, user, type ApiErrorResponse, type CreateAccountRequest, type CreateAccountResponse, type CreateGuestRequest, type CreateGuestResponse, type LogInRequest, type LogInResponse } from '@board-bot-arena/shared';
import { db } from '../db/index.ts';
import { eq } from 'drizzle-orm';
import { hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { config } from '../env.ts';
import z from 'zod';

const router = express.Router();

router.post('/register', 
  async (
    req: Request<{}, any, CreateAccountRequest>, 
    res: Response<CreateAccountResponse | ApiErrorResponse>
  ) => {
    try {
      const result = createAccountSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed", 
          details: z.flattenError(result.error).fieldErrors,
        });
      }

      const { username, email, password } = result.data;

      // check for existing account
      const existingUsers = await db.select().from(user).where(eq(user.email, email));
      if (existingUsers.length > 0) return res.status(409).json({ error: "Email already exists." });

      const hashedPassword = await hash(password, 10);

      // insert into db
      const [newUser] = await db.insert(user).values({
        name: username,
        email: email,
        role: "user",
        passwordHash: hashedPassword,
      }).returning();
      if (!newUser) return res.status(500).json({ error: "Failed to create user account" });

      // JWT generation
      const token = sign(
          { userId: newUser.id },
          config.JWT_SECRET,
          { expiresIn: '1h' }
      );

      res.json({ userId: newUser.id, token: token });
    } catch(e) {
      console.error("Registration error:", e);
      return res.status(500).json({ error: "Internal server error" });
    }
});


router.post('/guest', async (
  req: Request<{}, any, CreateGuestRequest>,
  res: Response<CreateGuestResponse | ApiErrorResponse>
) => {
  try {
    const randomNum = Math.floor(Math.random() * 900) + 100;

    const [newGuest] = await db.insert(user).values({
      name: `Guest${randomNum}`,
      role: "guest",
    }).returning();
    if (!newGuest) return res.status(500).json({ error: "Failed to create user account" });

    // JWT generation
    const token = sign(
        { userId: newGuest.id },
        config.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ userId: newGuest.id, token: token });
  } catch(e) {
    console.error("Registration error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/login', async (
  req: Request<{}, any, LogInRequest>,
  res: Response<LogInResponse | ApiErrorResponse>
) => {
  try {
      const result = logInSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed", 
          details: z.flattenError(result.error).fieldErrors,
        });
      }

      const { email, password } = result.data;

      const [existingUser] = await db.select().from(user).where(eq(user.email, email));
      if (!existingUser) return res.status(400).send(); // intentionally provide no details

      const hashedPassword = await hash(password, 10);
      if (hashedPassword !== existingUser.passwordHash) return res.status(400).send();

      // JWT generation
      const token = sign(
          { userId: existingUser.id },
          config.JWT_SECRET,
          { expiresIn: '1h' }
      );

    res.json({ userId: existingUser.id, token: token });
  } catch(e) {
    console.error("Registration error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});


export default router;