from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date

from database import engine, Base, SessionLocal
import models
import schemas

# Create database tables
Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Personal & Trip Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_or_create_dummy_user(db: Session):
    user = db.query(models.User).filter(models.User.username == "dummy_user").first()
    if not user:
        user = models.User(username="dummy_user", email="dummy@example.com")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@app.get("/")
def health_check():
    return {"status": "healthy", "message": "Expense Tracker API is running"}

@app.get("/health")
def health_check_alias():
    return {"status": "healthy"}

@app.post("/trips", response_model=schemas.Trip)
def create_trip(trip: schemas.TripCreate, db: Session = Depends(get_db)):
    user = get_or_create_dummy_user(db)
    db_trip = models.Trip(**trip.model_dump(), user_id=user.id)
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@app.get("/trips", response_model=List[schemas.Trip])
def get_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    trips = db.query(models.Trip).offset(skip).limit(limit).all()
    return trips

@app.post("/expenses", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    user = get_or_create_dummy_user(db)
    db_expense = models.Expense(**expense.model_dump(), user_id=user.id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@app.get("/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@app.get("/expenses", response_model=List[schemas.Expense])
def get_expenses(
    trip_id: Optional[int] = Query(None, description="Filter expenses by trip ID. If null, returns all expenses."),
    db: Session = Depends(get_db)
):
    query = db.query(models.Expense)
    if trip_id is not None:
        query = query.filter(models.Expense.trip_id == trip_id)
    return query.all()

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}

@app.get("/trips/{trip_id}/summary")
def get_trip_summary(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    total = db.query(func.sum(models.Expense.amount)).filter(models.Expense.trip_id == trip_id).scalar() or 0.0
    
    expenses = db.query(models.Expense).filter(models.Expense.trip_id == trip_id).all()
    categories = {}
    for exp in expenses:
        cat_name = exp.category.name if exp.category else "Uncategorized"
        categories[cat_name] = categories.get(cat_name, 0.0) + exp.amount

    return {
        "trip_id": trip.id,
        "trip_name": trip.name,
        "total_spent": total,
        "category_breakdown": categories
    }

@app.post("/seed")
def seed_data(db: Session = Depends(get_db)):
    user = get_or_create_dummy_user(db)
        
    chennai_categories = [
        {"name": "Commute", "description": "Auto/Uber/Rapido, Fuel, Metro"},
        {"name": "Food & Drink", "description": "Dining out, Swiggy/Zomato, Filter Coffee"},
        {"name": "Groceries", "description": "Saravana Stores, Pazhamudir Nilayam, Blinkit"},
        {"name": "Lifestyle", "description": "Shopping (EA/Phoenix), Grooming/Salon"},
        {"name": "Social", "description": "Movie tickets, Besant Nagar/ECR"},
        {"name": "Fixed", "description": "Rent, EB Bill, Mobile Recharge"},
    ]
    
    for cat_data in chennai_categories:
        cat = db.query(models.Category).filter(models.Category.name == cat_data["name"]).first()
        if not cat:
            cat = models.Category(**cat_data)
            db.add(cat)
    db.commit()

    category = db.query(models.Category).filter(models.Category.name == "Commute").first()

    trip_name = "Malaysia Trip (Langkawi & KL)"
    trip = db.query(models.Trip).filter(models.Trip.name == trip_name).first()
    if trip:
        return {"message": f"Trip '{trip_name}' already exists. Skipping seed to prevent duplicates."}
        
    trip = models.Trip(
        name=trip_name,
        description="Vacation to Malaysia",
        start_date=date(2026, 3, 14),
        end_date=date(2026, 3, 21),
        user_id=user.id
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    
    exp1 = models.Expense(
        amount=150.0,
        description="Airbnb in KL",
        date=date(2026, 3, 15),
        user_id=user.id,
        trip_id=trip.id,
        category_id=category.id
    )
    exp2 = models.Expense(
        amount=20.0,
        description="Street Food",
        date=date(2026, 3, 15),
        user_id=user.id,
        trip_id=trip.id,
        category_id=category.id
    )
    db.add_all([exp1, exp2])
    db.commit()
    
    return {"message": "Database seeded successfully with Malaysia trip and 2 expenses."}
