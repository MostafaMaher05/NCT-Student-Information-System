package models

type Student struct {
	// حددنا الطول بـ 50 و 255 عشان MySQL تقبله كمفتاح أساسي
	StudentCode    string `gorm:"primaryKey;column:student_code;size:50" json:"student_code"`
	FullName       string `gorm:"column:full_name;size:255" json:"full_name"`
	NationalNumber string `gorm:"column:national_number;size:50" json:"national_number"`
}

func (Student) TableName() string {
	return "students"
}