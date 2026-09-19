Real Authentication Setup
==============================

WHAT'S NEW
----------
Login and Sign Up are now REAL - not a UI demo:
- Passwords are hashed with bcrypt before being stored (never stored as plain text)
- A real SQLite database (users.db) is created automatically on first run
- Login checks the actual stored password hash
- Sessions use real JWT tokens
- Forgot Password generates a real, time-limited, hashed reset code

WHAT'S STILL DEMO-MODE (and why)
---------------------------------
The "forgot password" verification code is shown directly on screen instead
of being emailed. Sending a real email requires a third-party email service
(SendGrid, AWS SES, Mailgun, etc.) with its own account and API key, which
needs to be set up separately - it's not something that can be wired in
without you first creating that account. Everything else about the flow
(hashing the code, expiry, verification) is already production-shaped, so
swapping in real email sending later is a small, contained change.


STEP 1 - Install the new dependencies
------------------------------------------
On top of what you already installed for backend.py, run:
    pip install bcrypt pyjwt


STEP 2 - Put auth.py next to backend.py
---------------------------------------------
Both files must be in the same folder. auth.py is imported by backend.py.


STEP 3 - IMPORTANT: change the secret key
------------------------------------------------
Open auth.py and find this line near the top:
    JWT_SECRET = "CHANGE-THIS-TO-A-LONG-RANDOM-SECRET-BEFORE-REAL-DEPLOYMENT"

Generate a real random secret by running:
    python -c "import secrets; print(secrets.token_hex(32))"

Copy the output and paste it in as the new JWT_SECRET value. This secret is
what makes session tokens un-forgeable - don't skip this step, and don't
share the real value publicly (e.g. don't commit it to GitHub).


STEP 4 - Run the backend as usual
---------------------------------------
    python backend.py

A new file, users.db, will appear in the folder automatically - this is
your real user database (SQLite, a single file, no separate database server
needed).


STEP 5 - Use the frontend normally
----------------------------------------
Open login.html. You'll now see a "New here? Create an account" link since
there are no users yet on first run - click it, sign up with a real email
and password, and you'll be logged in for real. Next time, use those same
credentials to log in.

Signing Out now actually clears your session - you'll need to log in again.
"Forgot access?" now calls the real backend and generates a genuine
time-limited code (shown on screen, per the demo-mode note above).


SECURITY NOTES BEFORE ANY REAL DEPLOYMENT
------------------------------------------------
1. Change JWT_SECRET (see Step 3) - this is not optional.
2. Serve everything over HTTPS, not plain HTTP, in any real deployment.
3. Add rate-limiting to /auth/login and /auth/forgot-password before
   exposing this to the internet, to prevent brute-force password guessing
   and spam. The `slowapi` package is a straightforward way to add this to
   a FastAPI app.
4. Consider adding email verification on signup (confirm the email is real
   before activating the account) once real email sending is wired in.
