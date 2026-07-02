package handlers

import (
	"SIS/database"
	"SIS/models"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// Struct عشان نستقبل الكورس مع التكليفات بتاعته من صفحة Course Architect
type CoursePayload struct {
	Title           string `json:"title"`
	Semester        string `json:"semester"`
	HasSummerCourse bool   `json:"has_summer_course"` // الإضافة الجديدة لاستقبال حالة الزرار
	TotalGrade      int    `json:"total_grade"`
	FinalExamGrade  int    `json:"final_exam_grade"`
	ActivityGrade   int    `json:"activity_grade"`
	Assignments     []struct {
		AssignmentName string `json:"assignment_name"`
		MaxGrade       int    `json:"grade"`
	} `json:"assignments"`
}

// إضافة كورس جديد بتكليفاته
func AddCourse(c *gin.Context) {
	var payload CoursePayload

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. إنشاء وحفظ الكورس الأساسي
	course := models.Course{
		Title:           payload.Title,
		Semester:        payload.Semester,
		HasSummerCourse: payload.HasSummerCourse, // حفظ اختيار الأدمن
		TotalGrade:      payload.TotalGrade,
		FinalExamGrade:  payload.FinalExamGrade,
		ActivityGrade:   payload.ActivityGrade,
	}

	if err := database.DB.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
		return
	}

	database.DB.Model(&course).Update("has_summer_course", payload.HasSummerCourse)

	// 2. إنشاء وحفظ التكليفات الخاصة بالكورس ده (ربط بالـ CourseID)
	for _, asm := range payload.Assignments {
		courseAssignment := models.CourseAssignment{
			CourseID:       course.ID,
			AssignmentName: asm.AssignmentName,
			MaxGrade:       asm.MaxGrade,
		}
		database.DB.Create(&courseAssignment) // حفظ التكليف
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course and Assignments Created Successfully"})
}

// حذف الكورس وكل تكليفاته المرتبطة بيه
func DeleteCourse(c *gin.Context) {
	id := c.Param("id")

	// 1. مسح التكليفات المرتبطة بالكورس الأول
	database.DB.Where("course_id = ?", id).Delete(&models.CourseAssignment{})

	// 2. مسح الكورس نفسه
	if err := database.DB.Where("id = ?", id).Delete(&models.Course{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
}

func GetCourses(c *gin.Context) {
	var courses []models.Course

	// السر هنا في كلمة Preload
	if err := database.DB.Preload("Assignments").Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
		return
	}

	c.JSON(http.StatusOK, courses)
}

// إحصائيات الداشبورد
func DashboardStats(c *gin.Context) {
	var studentCount int64
	var courseCount int64

	database.DB.Model(&models.Student{}).Count(&studentCount)
	database.DB.Model(&models.Course{}).Count(&courseCount)

	c.JSON(http.StatusOK, gin.H{
		"total_students": studentCount,
		"total_courses":  courseCount,
	})
}

// 2. دالة توليد السمر كورس (بتجيب كل طلبة الجامعة وتشوف مين درجاته أقل من النص)
func GenerateSummerCourse(c *gin.Context) {
	originalCourseID := c.Param("id")

	var originalCourse models.Course
	if err := database.DB.Preload("Assignments").First(&originalCourse, originalCourseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Original course not found"})
		return
	}

	if !originalCourse.HasSummerCourse {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This course is configured to NOT have a summer edition"})
		return
	}
	if originalCourse.IsSummerCourse {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot generate a summer course from an existing summer course"})
		return
	}

	var existingSummer models.Course
	if err := database.DB.Where("original_course_id = ?", originalCourse.ID).First(&existingSummer).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A summer course already exists for this original course"})
		return
	}

	summerCourse := models.Course{
		Title:            originalCourse.Title + " (Summer)",
		Semester:         "Summer",
		HasSummerCourse:  false,
		TotalGrade:       originalCourse.TotalGrade,
		FinalExamGrade:   originalCourse.FinalExamGrade,
		ActivityGrade:    originalCourse.ActivityGrade,
		IsSummerCourse:   true,
		OriginalCourseID: &originalCourse.ID,
	}

	if err := database.DB.Create(&summerCourse).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create summer course"})
		return
	}

	for _, asm := range originalCourse.Assignments {
		newAssignment := models.CourseAssignment{
			CourseID:       summerCourse.ID,
			AssignmentName: asm.AssignmentName,
			MaxGrade:       asm.MaxGrade,
		}
		database.DB.Create(&newAssignment)
	}

	var allStudents []models.Student
	database.DB.Find(&allStudents)

	// حساب درجة النجاح الأساسية (نص المجموع الكلي)
	passingScore := float64(originalCourse.TotalGrade) / 2.0
	enrolledCount := 0

	for _, student := range allStudents {
		var enrollment models.StudentEnrollment
		err := database.DB.Where("course_id = ? AND student_code = ?", originalCourse.ID, student.StudentCode).First(&enrollment).Error

		hasFailed := true // هنعتبر الطالب ساقط لحد ما نثبت العكس
		if err == nil {
			var grade models.Grade
			if errGrade := database.DB.Where("enrollment_id = ?", enrollment.EnrollmentID).First(&grade).Error; errGrade == nil {

				// ==========================================
				// 🚀 السحر هنا: تطبيق لوجيك الرأفة في الباك إند
				// لو جاب درجة النجاح، أو قل عنها بحد أقصى 5 درجات (رأفة)
				// ==========================================
				if grade.TotalScore >= (passingScore - 5) {
					hasFailed = false // كده الطالب ده ناجح (سواء صافي أو بالرأفة) ومش هيدخل سمر
				}
			}
		}

		// لو ثبت إنه ساقط (وملحقتهوش حتى الرأفة)، نسجله في السمر كورس
		if hasFailed {
			newEnrollment := models.StudentEnrollment{
				StudentCode: student.StudentCode,
				CourseID:    summerCourse.ID,
			}
			database.DB.Create(&newEnrollment)
			enrolledCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":                  "Summer course generated successfully",
		"summer_course_id":         summerCourse.ID,
		"failed_students_enrolled": enrolledCount,
	})
}

// 1. دالة حفظ الدرجات من الفرانتد للداتابيز (Sync)
func SyncGrades(c *gin.Context) {
	courseIDStr := c.Param("id")
	courseID, _ := strconv.Atoi(courseIDStr)
	uintCourseID := uint(courseID)

	// استقبال الـ JSON بشكل ديناميكي مرن عشان ميتأثرش بنوع البيانات من الفرونت
	var rawPayload map[string]map[string]interface{}
	if err := c.ShouldBindJSON(&rawPayload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload format"})
		return
	}

	var assignments []models.CourseAssignment
	database.DB.Where("course_id = ?", uintCourseID).Order("id asc").Find(&assignments)

	for studentCode, grades := range rawPayload {
		var enrollment models.StudentEnrollment
		// السحر هنا: لو الطالب ملوش ريكورد في الكورس الأساسي، بنعمله ريكورد عشان نحفظ جواه الدرجة
		database.DB.Where("course_id = ? AND student_code = ?", uintCourseID, studentCode).
			FirstOrCreate(&enrollment, models.StudentEnrollment{
				CourseID:    uintCourseID,
				StudentCode: studentCode,
			})

		var gradeRecord models.Grade
		database.DB.Where("enrollment_id = ?", enrollment.EnrollmentID).
			FirstOrCreate(&gradeRecord, models.Grade{EnrollmentID: enrollment.EnrollmentID})

		// دالة مساعدة لتحويل الـ interface{} إلى float64 بأمان
		getFloat := func(val interface{}) float64 {
			if val == nil {
				return 0
			}
			if f, ok := val.(float64); ok {
				return f
			}
			return 0
		}

		gradeRecord.FinalExamScore = getFloat(grades["finalExam"])
		gradeRecord.ActivityScore = getFloat(grades["activity"])

		// حساب المجموع الكلي
		var total float64 = gradeRecord.FinalExamScore + gradeRecord.ActivityScore
		for k, v := range grades {
			if strings.HasPrefix(k, "asm_") {
				total += getFloat(v)
			}
		}
		gradeRecord.TotalScore = total
		database.DB.Save(&gradeRecord)

		// حفظ درجات الشيتات
		for i, asm := range assignments {
			asmKey := fmt.Sprintf("asm_%d", i+1)
			if asmVal, exists := grades[asmKey]; exists {
				var scoreRecord models.StudentAssignmentScore
				database.DB.Where("enrollment_id = ? AND assignment_id = ?", enrollment.EnrollmentID, asm.ID).
					FirstOrCreate(&scoreRecord, models.StudentAssignmentScore{
						EnrollmentID: enrollment.EnrollmentID,
						AssignmentID: asm.ID,
					})
				scoreRecord.Score = getFloat(asmVal)
				database.DB.Save(&scoreRecord)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Grades securely saved to database!"})
}

// 2. دالة استرجاع الدرجات المحفوظة من الداتابيز
func GetCourseGrades(c *gin.Context) {
	courseID := c.Param("id")

	result := make(map[string]map[string]float64)

	var enrollments []models.StudentEnrollment
	database.DB.Where("course_id = ?", courseID).Find(&enrollments)

	var assignments []models.CourseAssignment
	database.DB.Where("course_id = ?", courseID).Order("id asc").Find(&assignments)

	for _, enr := range enrollments {
		studentGrades := make(map[string]float64)

		var gradeRecord models.Grade
		if err := database.DB.Where("enrollment_id = ?", enr.EnrollmentID).First(&gradeRecord).Error; err == nil {
			studentGrades["finalExam"] = gradeRecord.FinalExamScore
			studentGrades["activity"] = gradeRecord.ActivityScore
		} else {
			studentGrades["finalExam"] = 0
			studentGrades["activity"] = 0
		}

		for i, asm := range assignments {
			var asmScore models.StudentAssignmentScore
			asmKey := fmt.Sprintf("asm_%d", i+1)
			if err := database.DB.Where("enrollment_id = ? AND assignment_id = ?", enr.EnrollmentID, asm.ID).First(&asmScore).Error; err == nil {
				studentGrades[asmKey] = asmScore.Score
			} else {
				studentGrades[asmKey] = 0
			}
		}

		result[enr.StudentCode] = studentGrades
	}

	c.JSON(http.StatusOK, result)
}
