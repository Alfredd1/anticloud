package file

import (
	"Backend/model"
	"Backend/persistence"
)

type Service struct {
	fileRepository persistence.FileRepository
}

func NewService(r persistence.FileRepository) *Service {
	return &Service{
		fileRepository: r,
	}
}

func (s Service) GetAllFiles(path string) ([]model.File, error) {
	return s.fileRepository.GetFiles(path)
}
