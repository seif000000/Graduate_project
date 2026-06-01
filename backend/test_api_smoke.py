"""Smoke test: verify all frontend api.js paths exist and core flows work."""
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

FRONTEND_PATHS = [
    ("POST", "/api/v1/auth/register"),
    ("POST", "/api/v1/auth/login"),
    ("GET", "/api/v1/auth/unverified-pharmacies"),
    ("POST", "/api/v1/auth/verify-pharmacy/1"),
    ("GET", "/api/v1/requests/me"),
    ("PATCH", "/api/v1/requests/my-request/1"),
    ("DELETE", "/api/v1/requests/my-request/1"),
    ("GET", "/api/v1/requests/all"),
    ("GET", "/api/v1/requests/stats/analytics"),
    ("GET", "/api/v1/users/me"),
    ("PATCH", "/api/v1/users/me"),
    ("POST", "/api/v1/users/me/verify-documents"),
    ("GET", "/api/v1/dashboard/me"),
    ("GET", "/api/v1/medicine/inventory"),
    ("POST", "/api/v1/medicine/donate"),
    ("GET", "/api/v1/medicine/me"),
    ("PATCH", "/api/v1/medicine/donation/1"),
    ("DELETE", "/api/v1/medicine/donation/1"),
    ("GET", "/api/v1/inventory/pharmacy"),
    ("POST", "/api/v1/inventory/pharmacy"),
    ("PATCH", "/api/v1/inventory/pharmacy/1"),
    ("DELETE", "/api/v1/inventory/pharmacy/1"),
    ("GET", "/api/v1/inventory/near-expiry"),
    ("GET", "/api/v1/users/pharmacy/stats"),
    ("GET", "/api/v1/requests/emergency-board"),
    ("POST", "/api/v1/requests/emergency"),
    ("POST", "/api/v1/requests/respond/1"),
    ("DELETE", "/api/v1/requests/admin/request/1"),
    ("GET", "/api/v1/users"),
    ("DELETE", "/api/v1/users/1"),
    ("GET", "/api/v1/users/admin/stats"),
    ("GET", "/api/v1/users/me/notifications"),
    ("POST", "/api/v1/users/me/notifications/read-all"),
    ("GET", "/api/v1/users/admin/reports"),
    ("POST", "/api/v1/users/me/report"),
    ("POST", "/api/v1/chat/ask"),
    ("GET", "/api/v1/vouchers/me"),
    ("POST", "/api/v1/vouchers/redeem/test"),
    ("GET", "/api/v1/medical-history/reports"),
    ("GET", "/api/v1/medical-history/logs"),
    ("POST", "/api/v1/medical-history/reports"),
    ("GET", "/api/v1/inbox/chats"),
    ("GET", "/api/v1/inbox/messages/1"),
    ("POST", "/api/v1/inbox/messages"),
]

def route_exists(method, path):
    for route in app.routes:
        if not hasattr(route, "path") or not hasattr(route, "methods"):
            continue
        if route.path == path.replace("{user_id}", "{user_id}").replace("/1", "/{request_id}"):
            pass
        # normalize param names
        route_path = route.path
        test_path = path
        for param in ["{request_id}", "{donation_id}", "{item_id}", "{user_id}", "{userId}", "{voucher_id}"]:
            test_path = test_path.replace("/1", "/{id}").replace("/test", "/{id}")
        # simpler: compare pattern
        if method in route.methods and _paths_match(route.path, path):
            return True
    return False

def _paths_match(route_path, test_path):
    r_parts = route_path.strip("/").split("/")
    t_parts = test_path.strip("/").split("/")
    if len(r_parts) != len(t_parts):
        return False
    for r, t in zip(r_parts, t_parts):
        if r.startswith("{") and r.endswith("}"):
            continue
        if r != t:
            return False
    return True

def main():
    missing = []
    for method, path in FRONTEND_PATHS:
        if not route_exists(method, path):
            missing.append(f"{method} {path}")

    print("=== Route existence check ===")
    if missing:
        print("MISSING ROUTES:")
        for m in missing:
            print(" ", m)
    else:
        print(f"OK: All {len(FRONTEND_PATHS)} frontend paths exist on backend")

    uid = uuid.uuid4().hex[:8]
    email = f"smoke_{uid}@test.com"
    password = "TestPass123!"

    print("\n=== Auth flow ===")
    reg = client.post("/api/v1/auth/register", json={
        "email": email,
        "full_name": "Smoke Test",
        "password": password,
        "role": "user",
    })
    assert reg.status_code == 200, f"Register failed: {reg.status_code} {reg.text}"
    print("Register: OK")

    login = client.post("/api/v1/auth/login", data={"username": email, "password": password})
    assert login.status_code == 200, f"Login failed: {login.status_code} {login.text}"
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login: OK")

    print("\n=== Authenticated endpoints ===")
    tests = [
        ("GET", "/api/v1/users/me", None, 200),
        ("GET", "/api/v1/dashboard/me", None, 200),
        ("GET", "/api/v1/medicine/me", None, 200),
        ("GET", "/api/v1/requests/me", None, 200),
        ("GET", "/api/v1/vouchers/me", None, 200),
        ("GET", "/api/v1/medical-history/reports", None, 200),
        ("GET", "/api/v1/medical-history/logs", None, 200),
        ("GET", "/api/v1/inbox/chats", None, 200),
        ("GET", "/api/v1/users/me/notifications", None, 200),
        ("GET", "/api/v1/medicine/inventory", None, 200),
        ("GET", "/api/v1/requests/all", None, 200),
        ("GET", "/api/v1/requests/emergency-board", None, 200),
    ]
    for method, path, body, expected in tests:
        if method == "GET":
            r = client.get(path, headers=headers)
        else:
            r = client.post(path, json=body, headers=headers)
        status = "OK" if r.status_code == expected else "FAIL"
        print(f"  {method} {path}: {r.status_code} {status}")
        if r.status_code != expected:
            print(f"    -> {r.text[:200]}")

    print("\n=== SOS create ===")
    sos = client.post("/api/v1/requests/emergency", headers=headers, json={
        "medicine_name": "Test Med",
        "description": "Smoke test",
        "urgency": "قصوى",
        "location": "Cairo",
    })
    print(f"  POST /requests/emergency: {sos.status_code}", "OK" if sos.status_code == 200 else sos.text[:200])

    print("\n=== Chat ===")
    chat = client.post("/api/v1/chat/ask", json={"message": "ما هي أعراض السكري؟"})
    print(f"  POST /chat/ask: {chat.status_code}", "OK" if chat.status_code == 200 else chat.text[:200])

    print("\n=== Donate ===")
    donate = client.post("/api/v1/medicine/donate", headers=headers, json={
        "medicine_name": "Glucophage",
        "quantity": "10",
        "expiry_date": "2026-12",
        "location": "Cairo",
        "price": "مجاني",
    })
    print(f"  POST /medicine/donate: {donate.status_code}", "OK" if donate.status_code == 200 else donate.text[:200])

    print("\n=== DONE ===")

if __name__ == "__main__":
    main()
