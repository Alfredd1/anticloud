package memory

import (
	"Backend/model"
	"log"
	"os"
)

type FileRepository struct {
}

func NewFileRepository() *FileRepository {
	return &FileRepository{}
}
func (r *FileRepository) GetFiles(path string) ([]model.File, error) {
	entries, err := os.ReadDir(path)
	if err != nil {
		log.Fatal(err)
	}
	files := make([]model.File, len(entries))

	for i, e := range entries {
		fi, _ := e.Info()
		file := model.File{}

		file.Name = fi.Name()
		file.Size = fi.Size()
		file.IsDirectory = fi.IsDir()
		files[i] = file
	}

	return files, nil
}
