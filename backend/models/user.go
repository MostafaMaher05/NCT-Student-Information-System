package models

type User struct {
	ID       uint   `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	Username string `gorm:"unique;column:username;size:100" json:"username"` // ضفنا الحجم هنا
	Password string `gorm:"column:password;size:255" json:"password"`
	Role     string `gorm:"column:role;size:50" json:"role"` 
}

func (User) TableName() string {
	return "users"
}