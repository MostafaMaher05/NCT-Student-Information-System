package models

type StudentAssignmentScore struct {
	ID           uint    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	EnrollmentID uint    `gorm:"column:enrollment_id" json:"enrollment_id"`
	AssignmentID uint    `gorm:"column:assignment_id" json:"assignment_id"`
	Score        float64 `gorm:"column:score" json:"score"`
}

func (StudentAssignmentScore) TableName() string {
	return "student_assignment_scores"
}