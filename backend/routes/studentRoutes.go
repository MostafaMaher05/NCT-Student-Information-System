package routes

import (
	"SIS/handlers"

	"github.com/gin-gonic/gin"
)

func StudentRoutes(router *gin.Engine) {

	router.GET("/api/students", handlers.GetStudents)
	router.POST("/api/students", handlers.AddStudent)
	router.DELETE("/api/students/:id", handlers.DeleteStudent)
	router.PUT("/api/students/:id", handlers.UpdateStudent)

	router.GET("/api/courses/:id/students", handlers.GetStudentsByCourse)
}
