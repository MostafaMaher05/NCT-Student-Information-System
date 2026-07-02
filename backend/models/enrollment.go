package models

type StudentEnrollment struct {
	EnrollmentID uint   `gorm:"primaryKey;autoIncrement;column:enrollment_id" json:"enrollment_id"`
	StudentCode  string `gorm:"column:student_code;size:50" json:"student_code"` // ضفنا الحجم هنا عشان متطابق مع كود الطالب
	CourseID     uint   `gorm:"column:course_id" json:"course_id"`
}

func (StudentEnrollment) TableName() string {
	return "student_enrollments"
}