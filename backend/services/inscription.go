package services

import "atenea/backend/database"

func NewStudentService(db *database.MemoryDB) *UserService {
	return &UserService{
		db: db,
	}
}

func (u *UserService) AddStudent() {
}
