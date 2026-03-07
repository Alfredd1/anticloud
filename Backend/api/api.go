//go:generate go tool oapi-codegen -config "api_config.yml" "./spec/openapi.yaml"

package api

import (
	"Backend/service/file"
	"context"
)

type Server struct {
	fileService file.Service
}

func NewServer(fs file.Service) *Server {
	return &Server{
		fileService: fs,
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
		Files: &fileStructSlice,
	}, nil
}
