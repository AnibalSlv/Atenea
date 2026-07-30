package services

import (
	"atenea/backend/database"
)

type RegisterService struct {
	db *database.MemoryDB

	// Aquí se podria inyectar una conexión a la base de datos local en el futuro
	// db *sql.DB
}

// NewLoginService crea una nueva instancia del servicio
func NewRegisterService(db *database.MemoryDB) *RegisterService {
	return &RegisterService{
		db: db,
	}
}

func (s *RegisterService) Register(name_input string, password_input string) bool {
	name := name_input
	password := password_input

	s.db.AddUser(name, password)

	return false
}
