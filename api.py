import requests

API_BASE = "http://localhost:8000/api"
LOGIN_URL = f"{API_BASE}/auth/login"
TUTORIALS_URL = f"{API_BASE}/video-tutorials/create"

LOGIN_PAYLOAD = {
    "email": "abid@gmail.com",
    "password": "YS2b7kat"
}

tutorials = [
    # FEEDING
    {
        "url": "https://www.youtube.com/watch?v=iKSSi5pi57I",
        "name": "How to Bottle Feed your Baby: Paced Bottle Feeding",
        "category": "FEEDING"
    },
    {
        "url": "https://www.youtube.com/watch?v=VCYWqni0TeM",
        "name": "How to Bottle Feed Properly | Infant Care",
        "category": "FEEDING"
    },
    {
        "url": "https://www.youtube.com/watch?v=4Rpl8H5V0pY",
        "name": "Bottle feeding your baby.",
        "category": "FEEDING"
    },
    {
        "url": "https://www.youtube.com/watch?v=ryq1Lse8LBA",
        "name": "7 Must-Know Bottle Feeding Tips (Pediatrician's Guide!)",
        "category": "FEEDING"
    },
    {
        "url": "https://www.youtube.com/watch?v=HUbgboXzaAk",
        "name": "Tips on Bottlefeeding Your Newborn",
        "category": "FEEDING"
    },
    {
        "url": "https://www.youtube.com/watch?v=KihSrKh0-4E",
        "name": "Baby Refusing the Bottle? Here's What to Do!",
        "category": "FEEDING"
    },

    # BATHING
    {
        "url": "https://www.youtube.com/watch?v=Jp4YIL4su3k",
        "name": "Keep Your Baby Warm Video for parents",
        "category": "BATHING"
    },
    {
        "url": "https://www.youtube.com/watch?v=7yxd25nZMaE",
        "name": "Complete Guide to Bathing a Newborn Baby (Step-By-Step)",
        "category": "BATHING"
    },

    # SLEEP_TRAINING
    {
        "url": "https://www.youtube.com/watch?v=LLqfRQdUP7k",
        "name": "How to Hip-Healthy Swaddle your Baby - IHDI",
        "category": "SLEEP_TRAINING"
    },
    {
        "url": "https://www.youtube.com/watch?v=MIDlhWTYkBo",
        "name": "Theory and Physiology of Skin-to-Skin",
        "category": "SLEEP_TRAINING"
    },

    # HEALTH
    {
        "url": "https://www.youtube.com/watch?v=VvfvZcJLWNU",
        "name": "7 Superfoods For Child's Brain Development And Intelligence",
        "category": "HEALTH"
    },
    {
        "url": "https://www.youtube.com/watch?v=MiMNbZstp68",
        "name": "Newborn Care 101: Essential Tips for First-Time Parents",
        "category": "HEALTH"
    },
    {
        "url": "https://www.youtube.com/watch?v=ofa5xI86VyY",
        "name": "Umbilical Cord Care for Newborns",
        "category": "HEALTH"
    },
    {
        "url": "https://www.youtube.com/watch?v=H-gOrAahQlY",
        "name": "Instructional Videos for New Moms - Thermometers and Taking Your Baby's Temperature",
        "category": "HEALTH"
    },
    {
        "url": "https://www.youtube.com/watch?v=JgyV6VDlKaM",
        "name": "10 Signs Your Baby is Healthy",
        "category": "HEALTH"
    },

    # DEVELOPMENT
    {
        "url": "https://www.youtube.com/watch?v=NTze3C5juSQ",
        "name": "How to Calm a Fussy Baby",
        "category": "DEVELOPMENT"
    },
    {
        "url": "https://www.youtube.com/watch?v=pmJSKlMG5Bs",
        "name": "How to Hold a Newborn - Basic Holds",
        "category": "DEVELOPMENT"
    },

    # SAFETY
    {
        "url": "https://www.youtube.com/watch?v=10o95KDJdpM",
        "name": "BABY SLING - CRADLE CARRY",
        "category": "SAFETY"
    },
    {
        "url": "https://www.youtube.com/watch?v=gcpzr4kCP10",
        "name": "Proper Baby Positioning in a Sling",
        "category": "SAFETY"
    },
    {
        "url": "https://www.youtube.com/watch?v=7K6arU5igAU",
        "name": "Sling Safety",
        "category": "SAFETY"
    },
]

# ── Step 1: Login ─────────────────────────────────────────────────
print("🔐 Logging in...")
login_resp = requests.post(LOGIN_URL, json=LOGIN_PAYLOAD)

if login_resp.status_code not in (200, 201):
    print(f"❌ Login failed: {login_resp.status_code} {login_resp.text}")
    exit(1)

token = login_resp.json().get("access_token")
if not token:
    print(f"❌ No access_token in response: {login_resp.json()}")
    exit(1)

print(f"✅ Logged in. Token received.\n")

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

# ── Step 2: Seed tutorials ────────────────────────────────────────
inserted = 0
failed = 0

for t in tutorials:
    resp = requests.post(TUTORIALS_URL, json=t, headers=headers)
    if resp.status_code in (200, 201):
        print(f"✅ Created: {t['name']}")
        inserted += 1
    else:
        print(f"❌ Failed:  {t['name']}")
        print(f"   Status: {resp.status_code} | Response: {resp.text}")
        failed += 1

print(f"\n── Done ──────────────────────────────")
print(f"✅ Inserted : {inserted}")
print(f"❌ Failed   : {failed}")
print(f"Total      : {len(tutorials)}")