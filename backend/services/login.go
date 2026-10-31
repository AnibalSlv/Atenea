package services

import (
	"atenea/backend/database"
	"fmt"

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
func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// -------- Funcion Principal --------

func (l *LoginService) Login(nameInput string, passwordInput string) bool {
	listUser := l.db.GetAllUser()

	for i := range listUser {
		fmt.Printf("Usuario [%d]: %+v\n", i, listUser[i])
	}

	for _, u := range listUser {
		if u.Name == nameInput {

			// Compara la contrasena ingresada por el Hash guardado (la contrasena encriptada)
			match := checkPasswordHash(passwordInput, u.Password)

			return match
		}
	}

	return false
}
