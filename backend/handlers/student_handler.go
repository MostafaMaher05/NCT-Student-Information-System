package handlers

import (
	"SIS/database"
	"SIS/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// جلب كل الطلاب
func GetStudents(c *gin.Context) {
	var students []models.Student
	database.DB.Find(&students)
	c.JSON(http.StatusOK, students)
}

// إضافة طالب جديد
func AddStudent(c *gin.Context) {
	var student models.Student

	if err := c.ShouldBindJSON(&student); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// حفظ في قاعدة البيانات
	if err := database.DB.Create(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save student to database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Student Added Successfully"})
}

// تحديث بيانات طالب موجود
func UpdateStudent(c *gin.Context) {
	id := c.Param("id") // استخراج الكود القديم من اللينك
	var student models.Student

	// 1. نتأكد إن الطالب موجود أصلاً
	if err := database.DB.Where("student_code = ?", id).First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	// 2. نستقبل الداتا الجديدة من الفورمة
	var updatedData models.Student
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 3. نحدث البيانات (الاسم والرقم القومي فقط)
	student.FullName = updatedData.FullName
	student.NationalNumber = updatedData.NationalNumber

	// 4. نحفظ التعديل في الداتابيز
	database.DB.Save(&student)

	c.JSON(http.StatusOK, gin.H{"message": "Student Updated Successfully"})
}

// حذف طالب عن طريق الكود بتاعه
func DeleteStudent(c *gin.Context) {
	id := c.Param("id") // استخراج الكود من اللينك

	if err := database.DB.Where("student_code = ?", id).Delete(&models.Student{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Student Deleted"})
}

// الدالة دي بتجيب الطلبة المربوطين بكورس معين عن طريق جدول الـ Enrollments
func GetStudentsByCourse(c *gin.Context) {
	courseID := c.Param("id")
	var students []models.Student

	// بنعمل Join عشان نجيب الطلبة اللي ليهم ريكورد في الكورس ده بس
	if err := database.DB.Joins("JOIN student_enrollments ON students.student_code = student_enrollments.student_code").
		Where("student_enrollments.course_id = ?", courseID).
		Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch enrolled students"})
		return
	}

	c.JSON(http.StatusOK, students)
}
