package persistence

import "Backend/model"

type FileRepository interface {
	GetFiles(path string) ([]model.File, error)
}
