package main

import (
	"Backend/api"
	"Backend/persistence/memory"
	"Backend/service/file"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {

	fileRepository := memory.NewFileRepository()
	fileService := file.NewService(fileRepository)

	server := api.NewServer(*fileService)

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
