package services

import (
	"atenea/backend/database"

	"golang.org/x/crypto/bcrypt"
)

type LoginService struct {
	db *database.MemoryDB

	// Aquí se podria inyectar una conexion a la base de datos local en el futuro
	// db *sql.DB
}

// NewLoginService crea una nueva instancia del servicio
func NewLoginService(db *database.MemoryDB) *LoginService {
	return &LoginService{
		db: db,
	}
}

// Verifica si la contraseña coincide con el hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *LoginService) Login(name_input string, password_input string) bool {
	listUser := s.db.GetUser()

	for _, u := range listUser {
		if u.User == name_input {

			// Compara la contrasena ingresada por el Hash guardado (la contrasena encriptada)
			match := CheckPasswordHash(password_input, u.Password)

			return match
		}
	}

	return false
}
