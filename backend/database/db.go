package database

import (
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {

	dsn :=
		"root:P@ssw0rd@tcp(127.0.0.1:3306)/nctu_control_db?charset=utf8mb4&parseTime=True&loc=Local"

	db, err := gorm.Open(
		mysql.Open(dsn),
		&gorm.Config{},
	)

	if err != nil {
		log.Fatal("Database Connection Failed:", err)
	}

	DB = db

	log.Println("Database Connected Successfully")
}
