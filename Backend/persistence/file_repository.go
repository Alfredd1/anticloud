package persistence

import "Backend/model"

type FileRepository interface {
	GetFiles() ([]model.File, error)
}
