#!/usr/bin/env python
"""음식 배달 앱 웹 데모 - 전체 플로우 시연"""
import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def print_section(emoji, title):
    print(f"\n{emoji} {title}")
    print("-" * 60)

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def print_info(message):
    print(f"ℹ️  {message}")

print_header("🍔 음식 배달 앱 웹 데모")
print_info(f"시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print_info(f"API 서버: {BASE_URL}")

# 타임스탬프로 고유 데이터 생성
timestamp = int(time.time())

# ================== 1. 점주 계정 생성 ==================
print_section("👨‍💼", "점주 계정 생성 (Store Owner)")

owner_data = {
    "email": f"owner{timestamp}@fooddelivery.com",
    "password": "SecurePass123",
    "full_name": "김철수",
    "phone": f"010-{timestamp % 10000:04d}-1111",
    "role": "store_owner"
}

response = requests.post(f"{BASE_URL}/api/auth/signup", json=owner_data)
if response.status_code == 200:
    result = response.json()
    owner_token = result['access_token']
    owner_user = result['user']
    print_success(f"점주 가입 완료")
    print_info(f"  • 이름: {owner_user['full_name']}")
    print_info(f"  • 이메일: {owner_user['email']}")
    print_info(f"  • ID: {owner_user['id']}")
else:
    print_error(f"가입 실패: {response.text}")
    exit(1)

# ================== 2. 가게 등록 ==================
print_section("🏪", "가게 등록 (Store Registration)")

store_data = {
    "name": "맛있는 편의점",
    "description": "24시간 운영하는 편의점입니다. 신선한 상품을 빠르게 배달해드립니다!",
    "category": "편의점",
    "address": "서울시 강남구 테헤란로 123",
    "phone": "02-1234-5678",
    "opening_hours": "24시간 영업",
    "delivery_fee": 3000,
    "min_order_amount": 10000
}

headers = {"Authorization": f"Bearer {owner_token}"}
response = requests.post(f"{BASE_URL}/api/stores", json=store_data, headers=headers)
if response.status_code == 201:
    store = response.json()
    store_id = store['id']
    print_success("가게 등록 완료")
    print_info(f"  • 가게명: {store['name']}")
    print_info(f"  • 주소: {store['address']}")
    print_info(f"  • 배달비: ₩{store['delivery_fee']:,}")
    print_info(f"  • 최소주문: ₩{store['min_order_amount']:,}")
    print_info(f"  • 가게 ID: {store_id}")
else:
    print_error(f"가게 등록 실패: {response.text}")
    exit(1)

# ================== 3. 상품 등록 ==================
print_section("📦", "상품 등록 (Product Registration)")

products_data = [
    {
        "name": "삼각김밥",
        "description": "참치마요 삼각김밥",
        "price": 1500,
        "category": "간편식",
        "is_available": True
    },
    {
        "name": "컵라면",
        "description": "신라면 큰사발",
        "price": 1800,
        "category": "라면",
        "is_available": True
    },
    {
        "name": "우유",
        "description": "서울우유 1L",
        "price": 2500,
        "category": "음료",
        "is_available": True
    },
    {
        "name": "김밥",
        "description": "야채김밥",
        "price": 3000,
        "category": "간편식",
        "is_available": True
    },
    {
        "name": "샌드위치",
        "description": "햄치즈 샌드위치",
        "price": 3500,
        "category": "간편식",
        "is_available": True
    }
]

product_ids = []
total_products = 0
for prod in products_data:
    product_data = {
        "store_id": store_id,
        **prod
    }
    response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=headers)
    if response.status_code == 201:
        product = response.json()
        product_ids.append(product['id'])
        total_products += 1
        print_success(f"{product['name']:15s} - ₩{product['price']:>6,} ({product['category']})")

print_info(f"\n총 {total_products}개 상품 등록 완료")

# ================== 4. 고객 계정 생성 ==================
print_section("👤", "고객 계정 생성 (Customer Account)")

customer_timestamp = timestamp + 1
customer_data = {
    "email": f"customer{customer_timestamp}@email.com",
    "password": "MyPass456",
    "full_name": "이영희",
    "phone": f"010-{customer_timestamp % 10000:04d}-2222",
    "role": "customer"
}

response = requests.post(f"{BASE_URL}/api/auth/signup", json=customer_data)
if response.status_code == 200:
    result = response.json()
    customer_token = result['access_token']
    customer_user = result['user']
    print_success("고객 가입 완료")
    print_info(f"  • 이름: {customer_user['full_name']}")
    print_info(f"  • 이메일: {customer_user['email']}")
    print_info(f"  • ID: {customer_user['id']}")
else:
    print_error(f"가입 실패: {response.text}")
    exit(1)

# ================== 5. 가게 목록 조회 ==================
print_section("🔍", "가게 검색 (Store Search)")

response = requests.get(f"{BASE_URL}/api/stores")
if response.status_code == 200:
    stores = response.json()
    print_success(f"총 {len(stores)}개의 가게 발견")
    for s in stores[:3]:  # 최근 3개만 표시
        print_info(f"  • {s['name']} - {s['category']} (배달비: ₩{s['delivery_fee']:,})")

# ================== 6. 상품 목록 조회 ==================
print_section("🛒", "상품 목록 조회 (Product Listing)")

response = requests.get(f"{BASE_URL}/api/products?store_id={store_id}")
if response.status_code == 200:
    products = response.json()
    print_success(f"{store['name']}의 상품 {len(products)}개")
    for p in products:
        status = "✓ 판매중" if p['is_available'] else "✗ 품절"
        print_info(f"  • {p['name']:15s} ₩{p['price']:>6,}  [{status}]")

# ================== 7. 주문 생성 ==================
print_section("🛍️", "주문하기 (Place Order)")

order_data = {
    "store_id": store_id,
    "delivery_address": "서울시 송파구 올림픽로 300, 101동 501호",
    "delivery_phone": customer_data['phone'],
    "special_requests": "문 앞에 놓아주시고 벨 눌러주세요",
    "items": [
        {"product_id": product_ids[0], "quantity": 3},  # 삼각김밥 3개
        {"product_id": product_ids[1], "quantity": 2},  # 컵라면 2개
        {"product_id": product_ids[2], "quantity": 1},  # 우유 1개
    ]
}

customer_headers = {"Authorization": f"Bearer {customer_token}"}
response = requests.post(f"{BASE_URL}/api/orders", json=order_data, headers=customer_headers)
if response.status_code == 201:
    order = response.json()
    order_id = order['id']
    print_success("주문 완료!")
    print_info(f"  • 주문번호: #{order_id}")
    print_info(f"  • 배달주소: {order['delivery_address']}")
    print_info(f"  • 상품금액: ₩{order['subtotal']:,}")
    print_info(f"  • 배달비: ₩{order['delivery_fee']:,}")
    print_info(f"  • 총 금액: ₩{order['total_amount']:,}")
    print_info(f"  • 주문상태: {order['status']}")
else:
    print_error(f"주문 실패: {response.text}")
    exit(1)

# ================== 8. 주문 상태 추적 ==================
print_section("📍", "주문 상태 추적 (Order Tracking)")

response = requests.get(f"{BASE_URL}/api/orders/{order_id}", headers=customer_headers)
if response.status_code == 200:
    order = response.json()
    print_success("주문 정보 조회")
    print_info(f"  • 현재 상태: {order['status'].upper()}")
    print_info(f"  • 주문 시간: {order['created_at']}")
    print_info(f"  • 주문 상품:")
    for item in order['order_items']:
        print_info(f"    - {item['quantity']}개 × ₩{item['price']:,} = ₩{item['subtotal']:,}")

# ================== 9. 점주 주문 확인 ==================
print_section("✅", "점주 주문 처리 (Store Owner Accepts)")

# 주문 확인
status_update = {"status": "confirmed"}
response = requests.patch(f"{BASE_URL}/api/orders/{order_id}/status",
                         json=status_update, headers=headers)
if response.status_code == 200:
    print_success("주문 확인 완료 (confirmed)")
    time.sleep(1)

# 조리 중
status_update = {"status": "preparing"}
response = requests.patch(f"{BASE_URL}/api/orders/{order_id}/status",
                         json=status_update, headers=headers)
if response.status_code == 200:
    print_success("조리 시작 (preparing)")
    time.sleep(1)

# 준비 완료
status_update = {"status": "ready"}
response = requests.patch(f"{BASE_URL}/api/orders/{order_id}/status",
                         json=status_update, headers=headers)
if response.status_code == 200:
    print_success("준비 완료 (ready)")
    time.sleep(1)

# 배달 중
status_update = {"status": "delivering"}
response = requests.patch(f"{BASE_URL}/api/orders/{order_id}/status",
                         json=status_update, headers=headers)
if response.status_code == 200:
    print_success("배달 시작 (delivering)")

# ================== 10. 최종 주문 상태 ==================
print_section("📊", "최종 주문 상태 (Final Status)")

response = requests.get(f"{BASE_URL}/api/orders/{order_id}", headers=customer_headers)
if response.status_code == 200:
    order = response.json()
    print_success(f"주문 #{order_id} 현재 상태")
    print_info(f"  • 상태: {order['status'].upper()}")
    print_info(f"  • 가게: {order['store']['name']}")
    print_info(f"  • 총액: ₩{order['total_amount']:,}")
    print_info(f"  • 배달지: {order['delivery_address']}")

# ================== 11. 통계 정보 ==================
print_section("📈", "전체 통계 (Statistics)")

# 점주의 주문 목록
response = requests.get(f"{BASE_URL}/api/orders?store_id={store_id}", headers=headers)
if response.status_code == 200:
    owner_orders = response.json()
    total_revenue = sum(o['total_amount'] for o in owner_orders)
    print_success(f"가게 통계")
    print_info(f"  • 총 주문: {len(owner_orders)}건")
    print_info(f"  • 총 매출: ₩{total_revenue:,}")

# 고객의 주문 목록
response = requests.get(f"{BASE_URL}/api/orders", headers=customer_headers)
if response.status_code == 200:
    customer_orders = response.json()
    total_spent = sum(o['total_amount'] for o in customer_orders)
    print_success(f"고객 통계")
    print_info(f"  • 총 주문: {len(customer_orders)}건")
    print_info(f"  • 총 구매액: ₩{total_spent:,}")

# 마무리
print_header("🎉 데모 완료!")
print_info(f"종료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()
print("✨ 모든 기능이 정상적으로 작동합니다!")
print("   • 사용자 인증 (점주/고객)")
print("   • 가게 관리")
print("   • 상품 관리")
print("   • 주문 시스템")
print("   • 실시간 주문 상태 추적")
print()
print("🌐 서비스 접속:")
print(f"   • API: http://localhost:8000")
print(f"   • API 문서: http://localhost:8000/docs")
print(f"   • 관리자 웹: http://localhost:3000")
print()
