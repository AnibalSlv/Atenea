package services

import (
	"atenea/backend/database"
	"fmt"
)

func WithdrawService(db *database.MemoryDB) *UserService {
	return &UserService{
		db: db,
	}
}

func (u *UserService) DeleteStudent(student database.Student, acceptanceLetter bool) (bool, error) {
	result := u.db.DeleteStudent(student)
	if !result {
		return false, fmt.Errorf("Estudiante no encontrado")
	}
	return true, nil
}
