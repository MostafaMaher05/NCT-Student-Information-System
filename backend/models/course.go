package models

type Course struct {
	ID               uint               `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	Title            string             `gorm:"column:title;size:255" json:"title"`
	Semester         string             `gorm:"column:semester;size:50" json:"semester"`
	TotalGrade       int                `gorm:"column:total_grade" json:"total_grade"`
	FinalExamGrade   int                `gorm:"column:final_exam_grade" json:"final_exam_grade"`
	ActivityGrade    int                `gorm:"column:activity_grade" json:"activity_grade"`

	// --- الحقول الخاصة بالسمر كورس ---
	HasSummerCourse  bool               `gorm:"column:has_summer_course;default:true" json:"has_summer_course"` // بيحفظ اختيار الأدمن (متاح له سمر ولا لأ)
	IsSummerCourse   bool               `gorm:"column:is_summer_course;default:false" json:"is_summer_course"` // بيحدد هل الكورس ده نفسه سمر كورس ولا عادي
	OriginalCourseID *uint              `gorm:"column:original_course_id" json:"original_course_id"` // Pointer عشان ممكن يكون Null للكورسات العادية

	Assignments      []CourseAssignment `json:"Assignments" gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE;"`
}

func (Course) TableName() string {
	return "courses"
}