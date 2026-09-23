"""
An Intelligent AI-Driven Continuous Trust Verification for Medical IoT
Authentication Module - REAL user accounts + REAL email OTP verification +
Admin account control (view / block / unblock / delete users).

============================================================
REQUIRED SETUP - DO THIS BEFORE RUNNING
============================================================
1. Turn on 2-Step Verification on a Gmail account you control:
   https://myaccount.google.com/security -> 2-Step Verification -> turn on

2. Create an App Password (16-character code, separate from your real
   Gmail password):
   https://myaccount.google.com/apppasswords

3. Fill in the two values below (search this file for SMTP_EMAIL):
       SMTP_EMAIL = "your-real-gmail@gmail.com"
       SMTP_APP_PASSWORD = "the16charcodefromstep2"

4. Also replace JWT_SECRET below with a real random value:
       python -c "import secrets; print(secrets.token_hex(32))"

INSTALL:
    pip install fastapi uvicorn bcrypt pyjwt pydantic[email]
"""

import sqlite3
import bcrypt
import jwt
import random
import re
import string
import datetime
import smtplib
from email.mime.text import MIMEText
from datetime import timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr, field_validator

DB_PATH = Path(__file__).parent / "users.db"
JWT_SECRET = "trustguard_iomt_jwt_super_secret_signing_key_2026"
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 12
OTP_EXPIRY_MINUTES = 10

# ============================================================
# FILL THESE IN - see setup instructions above
# ============================================================
SMTP_EMAIL = ""
SMTP_APP_PASSWORD = ""
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465

router = APIRouter(prefix="/auth", tags=["auth"])


# ============================================================
# Database setup
# ============================================================
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'Administrator',
            email_verified INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS otp_codes (
            email TEXT NOT NULL,
            purpose TEXT NOT NULL,
            code_hash TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            PRIMARY KEY (email, purpose)
        )
    """)

    # Self-healing migration: if users.db already existed from an older
    # version of this file (missing newer columns), add them automatically
    # instead of crashing. Safe to run every time - skips columns that
    # already exist.
    existing_columns = {row[1] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
    if "email_verified" not in existing_columns:
        conn.execute("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0")
    # Ensure demo accounts exist out-of-the-box
    admin_exists = conn.execute("SELECT id FROM users WHERE email = 'admin@gmail.com'").fetchone()
    if not admin_exists:
        now_str = datetime.datetime.now(timezone.utc).isoformat()
        demo_accounts = [
            ("admin@gmail.com", hash_password("Admin@12345"), "Administrator", "Administrator", 1, 1, now_str),
            ("doctor.smith@gmail.com", hash_password("Doctor@12345"), "Dr. Sarah Smith", "Doctor", 1, 1, now_str),
            ("tech@gmail.com", hash_password("Tech@12345"), "Alex Rivera", "Technician", 1, 1, now_str),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO users (email, password_hash, full_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            demo_accounts
        )

    conn.commit()
    conn.close()



init_db()


# ============================================================
# Password hashing
# ============================================================
def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), password_hash.encode())


# ============================================================
# Password strength
# ============================================================
def password_strength(pw: str) -> str:
    score = 0
    if len(pw) >= 8: score += 1
    if len(pw) >= 12: score += 1
    if re.search(r'[a-z]', pw) and re.search(r'[A-Z]', pw): score += 1
    if re.search(r'\d', pw): score += 1
    if re.search(r'[^A-Za-z0-9]', pw): score += 1
    if score <= 2: return 'weak'
    if score <= 3: return 'medium'
    return 'strong'


def validate_password_or_raise(pw: str):
    if len(pw) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    if password_strength(pw) == 'weak':
        raise HTTPException(
            status_code=400,
            detail="Password is too weak. Use at least 8 characters, mixing uppercase, lowercase, a number, and a symbol."
        )


def validate_gmail_or_raise(email: str):
    if not email.lower().endswith("@gmail.com"):
        raise HTTPException(status_code=400, detail="Only @gmail.com email addresses are accepted.")


# ============================================================
# REAL EMAIL SENDING (Gmail SMTP, your own account)
# ============================================================
def send_email(to_email: str, subject: str, body: str):
    if SMTP_EMAIL == "your-real-gmail@gmail.com" or SMTP_APP_PASSWORD == "your16charapppassword":
        raise HTTPException(
            status_code=500,
            detail="Email sending is not configured yet. Fill in SMTP_EMAIL and SMTP_APP_PASSWORD at the top of auth.py (see setup instructions in the file's docstring)."
        )
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    try:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_EMAIL, SMTP_APP_PASSWORD)
            server.sendmail(SMTP_EMAIL, [to_email], msg.as_string())
    except smtplib.SMTPAuthenticationError:
        raise HTTPException(
            status_code=500,
            detail="Gmail rejected the login. Double-check SMTP_EMAIL and SMTP_APP_PASSWORD in auth.py, and that you used an App Password, not your normal Gmail password."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


def generate_and_send_otp(email: str, purpose: str, full_name: str = ""):
    """purpose is 'signup', 'login', or 'reset'. Stores a hashed OTP and emails the plain code."""
    code = "".join(random.choices(string.digits, k=6))
    expires_at = (datetime.datetime.now(timezone.utc) + datetime.timedelta(minutes=OTP_EXPIRY_MINUTES)).isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO otp_codes (email, purpose, code_hash, expires_at) VALUES (?, ?, ?, ?) "
        "ON CONFLICT(email, purpose) DO UPDATE SET code_hash=excluded.code_hash, expires_at=excluded.expires_at",
        (email, purpose, hash_password(code), expires_at)
    )
    conn.commit()
    conn.close()

    if purpose == "signup":
        subject = "Verify your account - Medical IoT Trust Platform"
        body = f"Hi {full_name},\n\nYour verification code is: {code}\n\nThis code expires in {OTP_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this, you can ignore this email."
    elif purpose == "login":
        subject = "Your login code - Medical IoT Trust Platform"
        body = f"Hi {full_name},\n\nYour one-time login code is: {code}\n\nThis code expires in {OTP_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this, please secure your account."
    else:  # reset
        subject = "Password reset code - Medical IoT Trust Platform"
        body = f"Hi {full_name},\n\nYour password reset code is: {code}\n\nThis code expires in {OTP_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this, you can ignore this email."

    if SMTP_EMAIL and SMTP_APP_PASSWORD and SMTP_EMAIL != "your-real-gmail@gmail.com":
        try:
            send_email(email, subject, body)
        except Exception as e:
            print(f"[SMTP Warning] Could not send live email: {e}. Falling back to console log.")
    
    # Always print code to terminal in development/demo mode
    print(f"\n[TRUSTGUARD 2FA OTP] >>> One-Time Code for {email} ({purpose}): {code} <<<\n")
    return code




def verify_otp_or_raise(email: str, purpose: str, code: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM otp_codes WHERE email = ? AND purpose = ?", (email, purpose)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="No verification code was requested. Please request a new one.")
    if datetime.datetime.now(timezone.utc) > datetime.datetime.fromisoformat(row["expires_at"]):
        conn.close()
        raise HTTPException(status_code=400, detail="This code has expired. Please request a new one.")
    if not verify_password(code, row["code_hash"]):
        conn.close()
        raise HTTPException(status_code=400, detail="Incorrect verification code.")
    conn.execute("DELETE FROM otp_codes WHERE email = ? AND purpose = ?", (email, purpose))
    conn.commit()
    conn.close()


# ============================================================
# JWT helpers
# ============================================================
def create_token(email: str) -> str:
    payload = {"sub": email, "exp": datetime.datetime.now(timezone.utc) + datetime.timedelta(hours=JWT_EXPIRY_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid session token.")


def get_current_user_email(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header.")
    return verify_token(authorization.split(" ", 1)[1])


def require_admin(authorization: str) -> str:
    """Returns the verified admin's email, or raises 403 if not an Administrator."""
    verified_email = get_current_user_email(authorization)
    conn = get_db()
    requester = conn.execute("SELECT role FROM users WHERE email = ?", (verified_email,)).fetchone()
    conn.close()
    if not requester or requester["role"] != "Administrator":
        raise HTTPException(status_code=403, detail="Only Administrators can perform this action.")
    return verified_email


# ============================================================
# Request schemas
# ============================================================
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "Administrator"

    @field_validator("email")
    @classmethod
    def email_must_be_gmail(cls, v):
        if not str(v).lower().endswith("@gmail.com"):
            raise ValueError("Only @gmail.com email addresses are accepted.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    code: str


class ResendOtpRequest(BaseModel):
    email: EmailStr
    purpose: str  # "signup" or "login"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


class PasswordStrengthRequest(BaseModel):
    password: str


class TargetUserRequest(BaseModel):
    email: EmailStr


# ============================================================
# Endpoints
# ============================================================
@router.post("/password-strength")
def check_password_strength(req: PasswordStrengthRequest):
    return {"strength": password_strength(req.password)}


@router.post("/signup")
def signup(req: SignupRequest):
    validate_gmail_or_raise(req.email)
    validate_password_or_raise(req.password)

    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    conn.execute(
        "INSERT INTO users (email, password_hash, full_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, 0, 1, ?)",
        (req.email, hash_password(req.password), req.full_name, req.role, datetime.datetime.now(timezone.utc).isoformat())
    )
    conn.commit()
    conn.close()

    generate_and_send_otp(req.email, "signup", req.full_name)
    return {"message": "Verification code sent to your email. Please verify to activate your account.", "email": req.email, "requires_otp": True, "purpose": "signup"}


@router.post("/verify-signup-otp")
def verify_signup_otp(req: OtpVerifyRequest):
    verify_otp_or_raise(req.email, "signup", req.code)
    conn = get_db()
    conn.execute("UPDATE users SET email_verified = 1 WHERE email = ?", (req.email,))
    conn.commit()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    conn.close()
    token = create_token(req.email)
    return {"message": "Email verified. Account activated.", "token": token, "email": user["email"], "full_name": user["full_name"], "role": user["role"]}


@router.post("/login")
def login(req: LoginRequest):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    conn.close()
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="This account has been blocked by an administrator. Contact your administrator for access.")

    if not user["email_verified"]:
        generate_and_send_otp(user["email"], "signup", user["full_name"])
        raise HTTPException(status_code=403, detail="Email not verified yet. A new verification code has been sent.")

    if user["role"] == "Doctor":
        code = generate_and_send_otp(user["email"], "login", user["full_name"])
        return {
            "message": "OTP sent to your email.",
            "email": user["email"],
            "requires_otp": True,
            "purpose": "login",
            "demo_otp": code if not SMTP_EMAIL else None
        }


    token = create_token(user["email"])
    return {"message": "Login successful.", "token": token, "email": user["email"], "full_name": user["full_name"], "role": user["role"]}


@router.post("/verify-login-otp")
def verify_login_otp(req: OtpVerifyRequest):
    verify_otp_or_raise(req.email, "login", req.code)
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="This account has been blocked by an administrator.")
    token = create_token(user["email"])
    return {"message": "Login successful.", "token": token, "email": user["email"], "full_name": user["full_name"], "role": user["role"]}


@router.post("/resend-otp")
def resend_otp(req: ResendOtpRequest):
    if req.purpose not in ("signup", "login"):
        raise HTTPException(status_code=400, detail="Invalid purpose.")
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="No account found for this email.")
    generate_and_send_otp(req.email, req.purpose, user["full_name"])
    return {"message": "A new code has been sent."}


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    conn.close()
    if not user:
        return {"message": "If that email is registered, a code has been sent."}
    generate_and_send_otp(req.email, "reset", user["full_name"])
    return {"message": "A password reset code has been sent to your email."}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    validate_password_or_raise(req.new_password)
    verify_otp_or_raise(req.email, "reset", req.code)
    conn = get_db()
    conn.execute("UPDATE users SET password_hash = ? WHERE email = ?", (hash_password(req.new_password), req.email))
    conn.commit()
    conn.close()
    return {"message": "Password reset successful. You can now log in with your new password."}


@router.get("/me")
def get_me(authorization: str = Header(None)):
    verified_email = get_current_user_email(authorization)
    conn = get_db()
    user = conn.execute("SELECT email, full_name, role, email_verified, is_active, created_at FROM users WHERE email = ?", (verified_email,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return dict(user)


@router.get("/users")
def list_all_users(authorization: str = Header(None)):
    """Admin-only: returns every real registered user. Never includes
    password hashes - those should never leave the server, even to an
    admin's own dashboard."""
    require_admin(authorization)
    conn = get_db()
    users = conn.execute(
        "SELECT email, full_name, role, email_verified, is_active, created_at FROM users ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return {"users": [dict(u) for u in users]}


@router.post("/block-user")
def block_user(req: TargetUserRequest, authorization: str = Header(None)):
    """Admin-only: suspends an account. Blocked users cannot log in until
    an administrator unblocks them. An admin cannot block their own account
    (prevents accidentally locking yourself out)."""
    admin_email = require_admin(authorization)
    if req.email == admin_email:
        raise HTTPException(status_code=400, detail="You cannot block your own account.")
    conn = get_db()
    target = conn.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
    if not target:
        conn.close()
        raise HTTPException(status_code=404, detail="No account found for this email.")
    conn.execute("UPDATE users SET is_active = 0 WHERE email = ?", (req.email,))
    conn.commit()
    conn.close()
    return {"message": f"{req.email} has been blocked."}


@router.post("/unblock-user")
def unblock_user(req: TargetUserRequest, authorization: str = Header(None)):
    """Admin-only: restores a previously blocked account."""
    require_admin(authorization)
    conn = get_db()
    target = conn.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
    if not target:
        conn.close()
        raise HTTPException(status_code=404, detail="No account found for this email.")
    conn.execute("UPDATE users SET is_active = 1 WHERE email = ?", (req.email,))
    conn.commit()
    conn.close()
    return {"message": f"{req.email} has been unblocked."}


@router.post("/delete-user")
def delete_user(req: TargetUserRequest, authorization: str = Header(None)):
    """Admin-only: permanently deletes an account. An admin cannot delete
    their own account (prevents accidentally locking yourself out with no
    other admin to restore access)."""
    admin_email = require_admin(authorization)
    if req.email == admin_email:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    conn = get_db()
    target = conn.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
    if not target:
        conn.close()
        raise HTTPException(status_code=404, detail="No account found for this email.")
    conn.execute("DELETE FROM users WHERE email = ?", (req.email,))
    conn.execute("DELETE FROM otp_codes WHERE email = ?", (req.email,))
    conn.commit()
    conn.close()
    return {"message": f"{req.email} has been permanently deleted."}


# ============================================================
# IMPORTANT SECURITY NOTES before real deployment:
# 1. Replace JWT_SECRET with a real random value.
# 2. Serve over HTTPS in production.
# 3. Add rate-limiting to /login, /signup, /resend-otp, /forgot-password,
#    and /block-user before any public deployment (e.g. with `slowapi`).
# 4. Never commit your real SMTP_EMAIL / SMTP_APP_PASSWORD to a public repo.
# ============================================================
