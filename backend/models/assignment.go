package models

type CourseAssignment struct {
	ID             uint   `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	CourseID       uint   `gorm:"column:course_id" json:"course_id"` // Foreign Key للكورس
	AssignmentName string `gorm:"column:assignment_name" json:"assignment_name"`
	MaxGrade       int    `gorm:"column:max_grade" json:"max_grade"`
}

func (CourseAssignment) TableName() string {
	return "course_assignments"
}