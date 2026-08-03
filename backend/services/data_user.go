package services

import "atenea/backend/database"

type UserService struct {
	db *database.MemoryDB
}

func NewUserService(db *database.MemoryDB) *UserService {
	return &UserService{
		db: db,
	}
}

func (u *UserService) GetUser(name_input string) (*database.User, bool) {
	// Si no encontro el usuario devuelve un false, caso contrario un true
	return u.db.GetUserName(name_input)
}
