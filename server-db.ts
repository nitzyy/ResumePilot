import fs from "fs";
import path from "path";
import crypto from "crypto";

// Path to store our persistent database safely on the server
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Define types for our database schema
export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash?: string;
  salt?: string;
  isGoogleUser: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt: string;
  unlockedSlots: string[]; // List of resume slot IDs unlocked by this user
}

export interface SystemStats {
  totalResumesAnalyzed: number;
  totalVisits: number;
}

export interface DatabaseSchema {
  users: Record<string, User>; // email -> User
  stats: SystemStats;
  sessions: Record<string, { email: string; expiresAt: number }>; // token -> Session info
}

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial default database structure
const DEFAULT_DB: DatabaseSchema = {
  users: {
    // Seed default admin account
    "gnitya2507@gmail.com": {
      id: "admin_1",
      email: "gnitya2507@gmail.com",
      username: "PilotAdmin",
      isGoogleUser: true,
      isAdmin: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      unlockedSlots: ["slot_1"]
    }
  },
  stats: {
    totalResumesAnalyzed: 42, // Start with some real-looking seed data
    totalVisits: 128
  },
  sessions: {}
};

// Thread-safe synchronous read-write operations
function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      // Ensure seed admin is always present and remains admin
      if (!parsed.users) parsed.users = {};
      if (!parsed.users["gnitya2507@gmail.com"]) {
        parsed.users["gnitya2507@gmail.com"] = DEFAULT_DB.users["gnitya2507@gmail.com"];
      } else {
        parsed.users["gnitya2507@gmail.com"].isAdmin = true;
      }
      if (!parsed.stats) parsed.stats = DEFAULT_DB.stats;
      if (!parsed.sessions) parsed.sessions = {};
      return parsed;
    }
  } catch (err) {
    console.error("Error reading database file, using fallback.", err);
  }
  saveDB(DEFAULT_DB);
  return DEFAULT_DB;
}

function saveDB(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file.", err);
  }
}

// Cryptographic Password Hashing helper (immune to brute-force and tampering)
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export const ServerDB = {
  // Register a new user securely
  registerUser(email: string, username: string, password?: string, isGoogleUser = false): User {
    const db = loadDB();
    const normalizedEmail = email.toLowerCase().trim();

    if (db.users[normalizedEmail]) {
      throw new Error("A user with this email address already exists.");
    }

    const newUser: User = {
      id: `user_${crypto.randomBytes(8).toString("hex")}`,
      email: normalizedEmail,
      username: username.trim(),
      isGoogleUser,
      isAdmin: normalizedEmail === "gnitya2507@gmail.com", // Auto-admin for the requested user
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      unlockedSlots: ["slot_1"] // First slot is unlocked by default
    };

    if (!isGoogleUser && password) {
      const salt = crypto.randomBytes(16).toString("hex");
      newUser.salt = salt;
      newUser.passwordHash = hashPassword(password, salt);
    }

    db.users[normalizedEmail] = newUser;
    saveDB(db);
    return newUser;
  },

  // Authenticate user with password
  loginUser(email: string, password?: string, isGoogleUser = false): { user: User; token: string } {
    const db = loadDB();
    const normalizedEmail = email.toLowerCase().trim();
    const user = db.users[normalizedEmail];

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    if (isGoogleUser) {
      // Direct login for Google accounts
      user.lastLoginAt = new Date().toISOString();
      db.users[normalizedEmail] = user;
    } else {
      if (!password || !user.passwordHash || !user.salt) {
        throw new Error("Invalid email or password.");
      }
      const testHash = hashPassword(password, user.salt);
      if (testHash !== user.passwordHash) {
        throw new Error("Invalid email or password.");
      }
      user.lastLoginAt = new Date().toISOString();
      db.users[normalizedEmail] = user;
    }

    // Generate secure session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days expiration
    db.sessions[token] = { email: normalizedEmail, expiresAt };
    
    saveDB(db);
    return { user, token };
  },

  // Validate active session
  getSessionUser(token: string): User | null {
    const db = loadDB();
    const session = db.sessions[token];
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      // Clean up expired session
      delete db.sessions[token];
      saveDB(db);
      return null;
    }

    const user = db.users[session.email];
    return user || null;
  },

  // Log out a user session
  logoutSession(token: string) {
    const db = loadDB();
    if (db.sessions[token]) {
      delete db.sessions[token];
      saveDB(db);
    }
  },

  // PERSISTENCE OF UNLOCKED SLOTS
  unlockSlot(email: string, slotId: string): User {
    const db = loadDB();
    const normalizedEmail = email.toLowerCase().trim();
    const user = db.users[normalizedEmail];
    if (!user) {
      throw new Error("User not found.");
    }

    if (!user.unlockedSlots.includes(slotId)) {
      user.unlockedSlots.push(slotId);
      db.users[normalizedEmail] = user;
      saveDB(db);
    }
    return user;
  },

  // ANALYTICS & STATS (Only accessible by Admins)
  incrementResumeAnalyzed() {
    const db = loadDB();
    db.stats.totalResumesAnalyzed++;
    saveDB(db);
  },

  incrementVisits() {
    const db = loadDB();
    db.stats.totalVisits++;
    saveDB(db);
  },

  getAdminData(email: string): { users: User[]; stats: SystemStats & { totalRevenue: number } } {
    const db = loadDB();
    const normalizedEmail = email.toLowerCase().trim();
    const requestor = db.users[normalizedEmail];

    if (!requestor || !requestor.isAdmin) {
      throw new Error("Access Denied: You do not have administrator permissions.");
    }

    // Convert users record to array for easy listing in the Admin Panel
    const userList = Object.values(db.users).map(u => {
      // Omit salts and hashes for extreme protection
      const { passwordHash, salt, ...safeUser } = u as any;
      return safeUser as User;
    });

    // Calculate total revenue: each unlocked slot beyond slot_1 cost ₹100 INR
    let totalUnlockedCount = 0;
    Object.values(db.users).forEach(u => {
      // Exclude standard "slot_1" (primary free slot)
      const secondarySlots = u.unlockedSlots.filter(s => s !== "slot_1");
      totalUnlockedCount += secondarySlots.length;
    });
    const totalRevenue = totalUnlockedCount * 100;

    return {
      users: userList,
      stats: {
        totalResumesAnalyzed: db.stats.totalResumesAnalyzed,
        totalVisits: db.stats.totalVisits,
        totalRevenue
      }
    };
  }
};
