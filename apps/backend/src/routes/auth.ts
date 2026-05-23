import express, { type Request, type Response } from 'express';
import { createAccountSchema, logInSchema, session, user, UserRole, type ApiErrorResponse, type CreateAccountRequest, type CreateAccountResponse, type CreateGuestRequest, type CreateGuestResponse, type LogInRequest, type LogInResponse, type LogOutRequest, type LogOutResponse, type RefreshJWTRequest, type RefreshJWTResponse } from '@board-bot-arena/shared';
import { db } from '../db/index.ts';
import { and, eq } from 'drizzle-orm';
import { hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
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
      const accessToken = sign(
        { userId: newUser.id },
        config.JWT_ACCESS_SECRET,
        { expiresIn: '1h' }
      );
      const refreshToken = sign(
        { userId: newUser.id },
        config.JWT_REFRESH_SECRET,
        { expiresIn: '14d' },
      );

      await db.insert(session).values({
        userId: newUser.id,
        refreshToken: refreshToken,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
      });

      res.json({ userId: newUser.id, token: accessToken });
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
        config.JWT_ACCESS_SECRET,
        { expiresIn: '4h' }
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
    const accessToken = sign(
      { userId: existingUser.id },
      config.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = sign(
      { userId: existingUser.id },
      config.JWT_REFRESH_SECRET,
      { expiresIn: '14d' },
    );

    await db.insert(session).values({
      userId: existingUser.id,
      refreshToken: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    });

    res.json({ userId: existingUser.id, token: accessToken });
  } catch(e) {
    console.error("Registration error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/refresh', async (
  req: Request<{}, any, RefreshJWTRequest>,
  res: Response<RefreshJWTResponse | ApiErrorResponse>
): Promise<any> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token found." });
    }

    const payload = verify(refreshToken, config.JWT_REFRESH_SECRET) as {
      userId: number;
      role: string;
    };

    const [sessionData] = await db
      .select({
        userId: user.id,
        role: user.role,
        sessionId: session.id,
      })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .where(
        and(
          eq(session.refreshToken, refreshToken),
          eq(session.userId, payload.userId)
        )
      );

    if (!sessionData) {
      res.clearCookie('refreshToken');
      return res.status(403).json({ error: "Invalid refresh token." });
    }

    await db.delete(session).where(and(eq(session.refreshToken, refreshToken), eq(session.userId, sessionData.userId)));

    // Issue new JWT tokens
    const newAccessToken = sign(
      { userId: sessionData.userId, role: sessionData.role },
      config.JWT_ACCESS_SECRET,
      { expiresIn: '15m' },
    );
    const newRefreshToken = sign(
      { userId: sessionData.userId, role: sessionData.role },
      config.JWT_REFRESH_SECRET,
      { expiresIn: '14d' },
    );
    
    await db.insert(session).values({
      userId: sessionData.userId,
      refreshToken: newRefreshToken,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    });

    return res.status(200).json({ token: newAccessToken });

  } catch (error) {
    res.clearCookie('refreshToken');
    return res.status(403).json({ error: "Session expired. Please log in again." });
  }
});


router.post('/logout', async (
  req: Request<{}, any, LogOutRequest>,
  res: Response<LogOutResponse | ApiErrorResponse>
): Promise<any> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const payload = verify(refreshToken, config.JWT_REFRESH_SECRET, {
        ignoreExpiration: true
      }) as { userId: number; role: UserRole };
      
      await db.delete(session).where(
        and(
          eq(session.refreshToken, refreshToken),
          eq(session.userId, payload.userId)
        )
      );
    }
  } catch(e) {
    console.error("Error in logout: ", e);
  } finally {
    res.clearCookie('refreshToken');
    return res.status(200).json({});
  }
});


export default router;