package models

type Grade struct {
	ID             uint    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	EnrollmentID   uint    `gorm:"unique;column:enrollment_id" json:"enrollment_id"` // مربوط بتسجيل الطالب
	FinalExamScore float64 `gorm:"column:final_exam_score;default:0" json:"final_exam_score"`
	ActivityScore  float64 `gorm:"column:activity_score;default:0" json:"activity_score"`
	TotalScore     float64 `gorm:"column:total_score;default:0" json:"total_score"`
}

func (Grade) TableName() string {
	return "grades"
}
