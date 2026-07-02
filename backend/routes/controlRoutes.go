package routes

import (
	"SIS/handlers"

	"github.com/gin-gonic/gin"
)

func ControlRoutes(router *gin.Engine) {

	router.GET("/api/courses", handlers.GetCourses)
	router.POST("/api/courses", handlers.AddCourse)
	router.GET("/api/dashboard", handlers.DashboardStats)
	router.DELETE("/api/courses/:id", handlers.DeleteCourse)

	router.POST("/api/courses/:id/generate-summer", handlers.GenerateSummerCourse)
	router.POST("/api/courses/:id/grades", handlers.SyncGrades)
	router.GET("/api/courses/:id/grades", handlers.GetCourseGrades)
}
