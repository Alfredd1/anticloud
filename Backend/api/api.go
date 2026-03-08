//go:generate go tool oapi-codegen -config "api_config.yml" "./spec/openapi.yaml"

package api

import (
	"Backend/service/file"
	"Backend/service/pool"
	"context"
	"os"
	"strconv"
)

type Server struct {
	fileService file.Service
	pollService pool.Service
}

func NewServer(fs file.Service, ps pool.Service) *Server {
	return &Server{
		fileService: fs,
		pollService: ps,
	}
}

func (s Server) Ls(ctx context.Context, request LsRequestObject) (LsResponseObject, error) {
	files, _ := s.fileService.GetAllFiles(request.Body.Path)

	fileStructSlice := make([]struct {
		IsDirectory bool   `json:"isDirectory"`
		Name        string `json:"name"`
		Size        int    `json:"size"`
	}, len(files))

	for i, f := range files {
		fileStructSlice[i] = struct {
			IsDirectory bool   `json:"isDirectory"`
			Name        string `json:"name"`
			Size        int    `json:"size"`
		}{
			Name:        f.Name,
			Size:        int(f.Size),
			IsDirectory: f.IsDirectory,
		}
	}

	return Ls200JSONResponse{
		Files: fileStructSlice,
	}, nil
}

func (s Server) Size(ctx context.Context, request SizeRequestObject) (SizeResponseObject, error) {
	c := os.Getenv("POOL_CAP")
	size, err := strconv.Atoi(c)
	if err != nil {
		return Size200JSONResponse{Size: 0}, err
	}
	return Size200JSONResponse{Size: size}, nil
}

func (s Server) Free(ctx context.Context, request FreeRequestObject) (FreeResponseObject, error) {
	freeSpace, err := s.pollService.CalculateFreeSpace()
	if err != nil {
		return nil, err
	}
	return Free200JSONResponse{Free: freeSpace}, err
}
