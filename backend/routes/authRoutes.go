package routes

import (
	"SIS/handlers"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(router *gin.Engine) {

	router.POST(
		"/api/login",
		handlers.Login,
	)

}