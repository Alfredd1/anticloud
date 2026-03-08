package main

import (
	"Backend/api"
	"Backend/persistence/memory"
	"Backend/service/file"
	"Backend/service/pool"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("error loading .env file", err.Error())
	}
}

func main() {

	c := os.Getenv("POOL_CAP")
	size, err := strconv.Atoi(c)
	if err != nil {
		log.Fatal("error parsing pool capacity", err.Error())
	}
	if size < 1 {
		log.Fatal("server pool capacity must be greater than 1")
	}

	fileRepository := memory.NewFileRepository()
	fileService := file.NewService(fileRepository)
	poolService := pool.NewService()

	server := api.NewServer(*fileService, *poolService)

	router := chi.NewMux()
	router.Use(middleware.Logger)
	si := api.NewStrictHandler(server, nil)
	h := api.HandlerFromMuxWithBaseURL(si, router, "/api")

	s := &http.Server{
		Handler: h,
		Addr:    "0.0.0.0:3000",
	}
	log.Fatal(s.ListenAndServe())
}
