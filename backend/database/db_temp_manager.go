package database

type MemoryDB struct {
	users    []User
	students []Student
}

func NewMemoryDB() *MemoryDB {
	return &MemoryDB{
		users: []User{
			{
				Name:     "admin",
				Password: "$2a$10$Sglgmv9oipzpR4vnlLDRUeAwBohw7LP/Fi5daF.PirWeIATOtmV4S", //1234
			},
		},
		students: []Student{},
	}
}
