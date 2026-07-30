package database

// Struct para el Mok
type User struct {
	User     string
	Password string
}

type MemoryDB struct {
	users []User
}

func NewMemoryDB() *MemoryDB {
	return &MemoryDB{
		users: []User{},
	}
}

func (db *MemoryDB) AddUser(name_input string, password_input string) {
	var new_user User

	new_user.User = name_input
	new_user.Password = password_input

	db.users = append(db.users, new_user)
}

func (db *MemoryDB) GetUser() []User {
	return db.users
}
