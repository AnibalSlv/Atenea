package services

import (
	"atenea/backend/database"
	"fmt"
	"strings"
)

func NewStudentService(db *database.MemoryDB) *UserService {
	return &UserService{
		db: db,
	}
}

func (u *UserService) AddStudent(student database.Student) (bool, error) {
	fmt.Println("---- Verificando datos del alumno ----")

	if strings.TrimSpace(student.Name) == "" {
		return false, fmt.Errorf("Falta el nombre del alumno")
	}
	if strings.TrimSpace(student.LastName) == "" {
		return false, fmt.Errorf("Falta el apellido del alumno")
	}
	if student.Age < 3 || student.Age > 17 {
		return false, fmt.Errorf("Edad no valida")
	}
	if strings.TrimSpace(student.Grade) == "" {
		return false, fmt.Errorf("Grado no valido")
	}
	if strings.TrimSpace(student.Section) == "" {
		return false, fmt.Errorf("Seccion no valida")
	}
	if student.InhabitantNumber <= 0 {
		return false, fmt.Errorf("Numero no habitantes no valido")
	}
	if student.InhabitantFamily <= 0 {
		return false, fmt.Errorf("Numero de familias no valida")
	}
	if strings.TrimSpace(student.Father.Name) == "" && strings.TrimSpace(student.Mother.Name) == "" && strings.TrimSpace(student.Representative.Name) == "" {
		return false, fmt.Errorf("Nombre del representante no valido")
	}
	if student.Father.Id < 0 && student.Mother.Id < 0 && student.Representative.Id < 0 {
		return false, fmt.Errorf("Cedula del representante no valida")
	}

	u.db.AddStudent(student)
	return true, nil
}
