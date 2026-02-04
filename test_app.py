#!/usr/bin/env python
import requests
import json

BASE_URL = "http://localhost:8000"

print("🚀 음식 배달 앱 테스트 시작\n")

# 1. 점주 회원가입
print("1️⃣ 점주 회원가입...")
import time
timestamp = int(time.time())
signup_data = {
    "email": f"owner{timestamp}@test.com",
    "password": "pass123",
    "full_name": "이점주",
    "phone": f"010-{timestamp % 10000:04d}-{timestamp % 10000:04d}",
    "role": "store_owner"
}
response = requests.post(f"{BASE_URL}/api/auth/signup", json=signup_data)
print(f"   상태: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    token = result['access_token']
    user = result['user']
    print(f"   ✅ 회원가입 성공! ID: {user['id']}, 이름: {user['full_name']}\n")
else:
    print(f"   ❌ 실패: {response.text}\n")
    exit(1)

# 2. 가게 등록
print("2️⃣ 가게 등록...")
store_data = {
    "name": "맛있는 편의점",
    "description": "24시간 운영하는 편의점",
    "category": "편의점",
    "address": "서울시 강남구 테헤란로 123",
    "phone": "02-1234-5678",
    "opening_hours": "24시간",
    "delivery_fee": 3000,
    "min_order_amount": 10000
}
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(f"{BASE_URL}/api/stores", json=store_data, headers=headers)
print(f"   상태: {response.status_code}")
if response.status_code == 201:
    store = response.json()
    store_id = store['id']
    print(f"   ✅ 가게 등록 성공! ID: {store_id}, 이름: {store['name']}\n")
else:
    print(f"   ❌ 실패: {response.text}\n")
    exit(1)

# 3. 상품 등록
print("3️⃣ 상품 등록...")
products = [
    {"name": "삼각김밥", "price": 1500, "category": "간편식"},
    {"name": "컵라면", "price": 1800, "category": "라면"},
    {"name": "우유", "price": 2500, "category": "음료"}
]

product_ids = []
for prod in products:
    product_data = {
        "store_id": store_id,
        "name": prod["name"],
        "description": f"맛있는 {prod['name']}",
        "price": prod["price"],
        "category": prod["category"],
        "is_available": True
    }
    response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=headers)
    if response.status_code == 201:
        product = response.json()
        product_ids.append(product['id'])
        print(f"   ✅ {product['name']} 등록 (₩{product['price']})")
    else:
        print(f"   ❌ {prod['name']} 등록 실패: {response.text}")

print()

# 4. 고객 회원가입
print("4️⃣ 고객 회원가입...")
customer_timestamp = int(time.time()) + 1
customer_data = {
    "email": f"customer{customer_timestamp}@test.com",
    "password": "pass123",
    "full_name": "김고객",
    "phone": f"010-{customer_timestamp % 10000:04d}-{customer_timestamp % 10000:04d}",
    "role": "customer"
}
response = requests.post(f"{BASE_URL}/api/auth/signup", json=customer_data)
print(f"   상태: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    customer_token = result['access_token']
    customer = result['user']
    print(f"   ✅ 고객 가입 성공! ID: {customer['id']}, 이름: {customer['full_name']}\n")
else:
    print(f"   ❌ 실패: {response.text}\n")
    exit(1)

# 5. 가게 목록 조회
print("5️⃣ 가게 목록 조회...")
response = requests.get(f"{BASE_URL}/api/stores")
stores = response.json()
print(f"   ✅ 가게 {len(stores)}개 발견\n")

# 6. 주문 생성
print("6️⃣ 주문 생성...")
order_data = {
    "store_id": store_id,
    "delivery_address": "서울시 송파구 올림픽로 300",
    "delivery_phone": "010-5555-6666",
    "special_requests": "문 앞에 놔주세요",
    "items": [
        {"product_id": product_ids[0], "quantity": 4},  # 삼각김밥 4개 = 6000원
        {"product_id": product_ids[1], "quantity": 3}   # 컵라면 3개 = 5400원 (총 11400원)
    ]
}
customer_headers = {"Authorization": f"Bearer {customer_token}"}
response = requests.post(f"{BASE_URL}/api/orders", json=order_data, headers=customer_headers)
print(f"   상태: {response.status_code}")
if response.status_code == 201:
    order = response.json()
    order_id = order['id']
    print(f"   ✅ 주문 성공! ID: {order_id}, 총액: ₩{order['total_amount']}\n")
else:
    print(f"   ❌ 실패: {response.text}\n")
    exit(1)

# 7. 주문 상태 조회
print("7️⃣ 주문 상태 조회...")
response = requests.get(f"{BASE_URL}/api/orders/{order_id}", headers=customer_headers)
if response.status_code == 200:
    order = response.json()
    print(f"   ✅ 주문 상태: {order['status']}")
    print(f"   배달 주소: {order['delivery_address']}")
    print(f"   상품 {len(order['order_items'])}개\n")

# 8. 점주가 주문 상태 업데이트
print("8️⃣ 점주가 주문 확인...")
status_update = {"status": "confirmed"}
response = requests.patch(f"{BASE_URL}/api/orders/{order_id}/status", json=status_update, headers=headers)
if response.status_code == 200:
    order = response.json()
    print(f"   ✅ 주문 상태 업데이트: {order['status']}\n")

print("🎉 전체 플로우 테스트 완료!")
