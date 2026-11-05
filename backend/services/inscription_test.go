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

func TestUpdateStudent(t *testing.T) {
	db := database.NewMemoryDB()
	service := NewUserService(db)

	validStudent := database.Student{
		Id:               1,
		Name:             "María",
		LastName:         "Pérez",
		Age:              12,
		Grade:            "6to",
		Section:          "B",
		InhabitantNumber: 3,
		InhabitantFamily: 1,
		Representative:   database.ParentData{Name: "Pedro Pérez", Id: 789012},
	}

	tests := []struct {
		name         string
		setupStudent *database.Student // Si necesita ser registrado antes
		updateData   database.Student  // Datos a enviar en la actualización
		expectError  bool
	}{
		{
			name:         "Falla - Estudiante no encontrado",
			setupStudent: nil,
			updateData:   validStudent,
			expectError:  true,
		},
		{
			name:         "Caso exitoso - Actualización de estudiante existente",
			setupStudent: &validStudent,
			updateData: func() database.Student {
				s := validStudent
				s.Name = "María Josefina" // Modificamos un campo
				return s
			}(),
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Si el test requiere que el estudiante exista previamente, lo agregamos
			if tt.setupStudent != nil {
				_, _ = service.AddStudent(*tt.setupStudent)
			}

			studentJSON, _ := json.MarshalIndent(tt.updateData, "", "  ")
			fmt.Printf("--- Probando caso update: %s ---\n%s\n", tt.name, string(studentJSON))

			success, err := service.UpdateStudent(tt.updateData)

			if tt.expectError {
				if err == nil {
					t.Errorf("Se esperaba un error al actualizar, pero la función tuvo éxito")
				}
			} else {
				if err != nil {
					t.Errorf("No se esperaba error al actualizar, pero ocurrió: %v", err)
				}
				if !success {
					t.Errorf("Se esperaba true en el success de actualización")
				}
			}
		})
	}
}
