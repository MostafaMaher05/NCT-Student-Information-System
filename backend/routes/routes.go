package routes

import (
	"github.com/gin-gonic/gin"
)

// SetupRoutes بتجمع كل مسارات النظام عشان نبعتها لملف main
func SetupRoutes(router *gin.Engine) {
	
	// تشغيل مسارات تسجيل الدخول
	AuthRoutes(router)

	// تشغيل مسارات الطلاب
	StudentRoutes(router)

	// تشغيل مسارات الكنترول (الكورسات والداشبورد)
	ControlRoutes(router)
}