from database import SessionLocal
from models import User, UserRole
from auth import get_password_hash

def create_customer():
    db = SessionLocal()

    try:
        # 이미 존재하는지 확인
        existing = db.query(User).filter(User.email == 'customer@test.com').first()
        if existing:
            print("고객 계정이 이미 존재합니다.")
            print(f"이메일: customer@test.com")
            print(f"비밀번호: password123")
            return

        # 새 고객 계정 생성
        new_customer = User(
            email='customer@test.com',
            hashed_password=get_password_hash('password123'),
            full_name='김고객',
            phone='010-1234-5678',
            role=UserRole.CUSTOMER
        )

        db.add(new_customer)
        db.commit()

        print("고객 계정이 생성되었습니다!")
        print(f"이메일: customer@test.com")
        print(f"비밀번호: password123")
        print(f"이름: 김고객")

    except Exception as e:
        print(f"에러 발생: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_customer()
