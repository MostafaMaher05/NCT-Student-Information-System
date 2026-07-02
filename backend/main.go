package main

import (
	"SIS/database"
	"SIS/models"
	"SIS/routes"
	"log"

	"github.com/gin-gonic/gin"
)

// دالة عشان تسمح للريأكت (بورت 3000) يكلم الـ Go (بورت 8080) بدون مشاكل CORS
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	// 1. الاتصال بقاعدة البيانات MySQL
	database.ConnectDB()

	// 2. إنشاء الجداول أوتوماتيكياً في قاعدة البيانات (Auto Migrate)
	err := database.DB.AutoMigrate(
		&models.User{},
		&models.Student{},
		&models.Course{},
		&models.CourseAssignment{},
		&models.StudentEnrollment{},
		&models.StudentAssignmentScore{},
		&models.Grade{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database Migration Completed Successfully")

	// 3. إعداد السيرفر (Gin Router)
	router := gin.Default()

	// تفعيل الـ CORS
	router.Use(CORSMiddleware())

	// 4. تشغيل كل المسارات اللي عملناها في ملف routes.go
	routes.SetupRoutes(router)

	// 5. تشغيل السيرفر على بورت 8080
	log.Println("Server is running on port 8080...")
	router.Run(":8080")
}