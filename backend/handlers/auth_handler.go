package handlers

import (
	"SIS/database"
	"SIS/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// إنشاء Struct مؤقت عشان نقرا البيانات اللي جاية من شاشة اللوجين
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func Login(c *gin.Context) {
	var req LoginRequest

	// ربط الداتا اللي جاية من الريأكت
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var user models.User
	
	// البحث عن المستخدم في الداتابيز
	result := database.DB.Where("username = ? AND password = ?", req.Username, req.Password).First(&user)

	if result.Error != nil {
		// لو مفيش يوزر بالبيانات دي
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	// لو نجح، نرجع رسالة والـ Role
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"role":    user.Role,
	})
}