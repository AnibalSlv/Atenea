package database

// Struct para el Mok
type User struct {
	Name     string
	Password string
}

func (db *MemoryDB) AddUser(nameInput string, passwordInput string) {

	newUser := User{
		Name:     nameInput,
		Password: passwordInput,
	}

	db.users = append(db.users, newUser)
}

func (db *MemoryDB) GetAllUser() []User {
	return db.users
}

func (db *MemoryDB) GetUserName(nameInput string) (*User, bool) {

	for i := 0; i < len(db.users); i++ {
		if db.users[i].Name == nameInput {
			return &db.users[i], true
		}
	}

	return nil, false
}
