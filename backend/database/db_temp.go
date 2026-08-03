package database

type Stat struct {
	Level int
	Money int
}

// Struct para el Mok
type User struct {
	Name     string
	Password string
	Stats    []Stat
}

type MemoryDB struct {
	users []User
}

func NewMemoryDB() *MemoryDB {
	return &MemoryDB{
		users: []User{},
	}
}

func (db *MemoryDB) AddUser(nameInput string, passwordInput string) {

	statsDefault := Stat{
		Level: 0,
		Money: 0,
	}

	newUser := User{
		Name:     nameInput,
		Password: passwordInput,
		Stats:    []Stat{statsDefault},
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
