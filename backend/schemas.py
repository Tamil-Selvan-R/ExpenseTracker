from pydantic import BaseModel, Field, EmailStr, ConfigDict
from datetime import date, datetime
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ExpenseBase(BaseModel):
    amount: float = Field(gt=0, description="Amount must be greater than 0")
    description: Optional[str] = None
    date: date
    trip_id: Optional[int] = None
    category_id: int

class ExpenseCreate(ExpenseBase):
    pass

class SimpleCategory(BaseModel):
    id: int
    name: str

class SimpleTrip(BaseModel):
    id: int
    name: str

class Expense(ExpenseBase):
    id: int
    user_id: int
    category: Optional[SimpleCategory] = None
    trip: Optional[SimpleTrip] = None
    model_config = ConfigDict(from_attributes=True)

class TripBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date

class TripCreate(TripBase):
    pass

class Trip(TripBase):
    id: int
    user_id: int
    expenses: List[Expense] = []
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    trips: List[Trip] = []
    model_config = ConfigDict(from_attributes=True)
