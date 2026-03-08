package pool

import (
	"os"
	"strconv"
)

var homeDir, _ = os.UserHomeDir() // fugly

type Service struct {
}

func NewService() *Service {
	return &Service{}
}

func (s Service) CalculateFreeSpace() (float32, error) {
	f, err := os.Open(homeDir + "/.anticloud/pool_size.txt")
	if err != nil {
		return 0, err
	}
	defer f.Close()
	buf := make([]byte, 1024)
	n, err := f.Read(buf)
	if err != nil {
		return 0, err
	}
	bytes, err := strconv.Atoi(string(buf[:n-1]))
	if err != nil {
		return 0, err
	}
	gb := (float32(bytes) / 1024.0) / 1024.0

	pc, err := strconv.ParseFloat(os.Getenv("POOL_CAP"), 32)
	if err != nil {
		return 0, err
	}

	return float32(pc) - gb, nil
}
