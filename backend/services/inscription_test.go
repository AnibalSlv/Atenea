package services

import (
	"atenea/backend/database"
	"encoding/json"
	"fmt"
	"testing"
)

func TestAddStudent(t *testing.T) {
	// Se crea una instancia limpia de la base de datos y el servicio para el test
	db := database.NewMemoryDB()
	service := NewUserService(db)

	// Casos de prueba (tanto fallidos como exitosos)
	tests := []struct {
		name        string
		student     database.Student
		expectError bool
	}{
		{
			name: "Caso exitoso - Alumno válido",
			student: database.Student{
				Name:             "Carlos",
				LastName:         "Gómez",
				Age:              10,
				Grade:            "4to",
				Section:          "A",
				InhabitantNumber: 4,
				InhabitantFamily: 1,
				Representative:   database.ParentData{Name: "Ana Gómez", Id: 123456},
			},
			expectError: false,
		},
		{
			name: "Falla - Falta el nombre",
			student: database.Student{
				Name:             "",
				LastName:         "Gómez",
				Age:              10,
				Grade:            "4to",
				Section:          "A",
				InhabitantNumber: 4,
				InhabitantFamily: 1,
				Representative:   database.ParentData{Name: "Ana Gómez", Id: 123456},
			},
			expectError: true,
		},
		{
			name: "Falla - Edad no válida",
			student: database.Student{
				Name:             "Carlos",
				LastName:         "Gómez",
				Age:              20, // Fuera del rango
				Grade:            "4to",
				Section:          "A",
				InhabitantNumber: 4,
				InhabitantFamily: 1,
				Representative:   database.ParentData{Name: "Ana Gómez", Id: 123456},
			},
			expectError: true,
		},
	}

	// Se ejecuta el bucle probando cada caso
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Se imprime el struct de forma limpia y legible usando JSON indentado
			studentJSON, _ := json.MarshalIndent(tt.student, "", "  ")
			fmt.Printf("--- Probando caso: %s ---\n%s\n", tt.name, string(studentJSON))

			success, err := service.AddStudent(tt.student)

			if tt.expectError {
				if err == nil {
					t.Errorf("Se esperaba un error, pero la función se ejecutó con éxito")
				}
			} else {
				if err != nil {
					t.Errorf("No se esperaba error, pero ocurrió: %v", err)
				}
				if !success {
					t.Errorf("Se esperaba true en el success")
				}
			}
		})
	}
}
