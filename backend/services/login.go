package services

import (
	"atenea/backend/database"
)

type LoginService struct {
	db *database.MemoryDB

	// Aquí se podria inyectar una conexión a la base de datos local en el futuro
	// db *sql.DB
}

// NewLoginService crea una nueva instancia del servicio
func NewLoginService(db *database.MemoryDB) *LoginService {
	return &LoginService{
		db: db,
	}
}

func (s *LoginService) Login(name_input string, password_input string) bool {
	name := name_input
	password := password_input

	listUser := s.db.GetUser()

	for _, u := range listUser {
		if name == u.User && password == u.Password {
			return true
		}
	}

	return false
}
