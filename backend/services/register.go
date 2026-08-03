package services

import (
	"atenea/backend/database"

	"golang.org/x/crypto/bcrypt"
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

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func (r *RegisterService) Register(name_input string, password_input string) bool {
	name := name_input
	password, err := hashPassword(password_input)
	if err != nil {
		return false
	}

	r.db.AddUser(name, password)

	return true
}
