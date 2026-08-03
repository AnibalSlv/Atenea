package backend

import (
	"atenea/backend/database"
	"atenea/backend/services"
)

type BackendManager struct {
	Login    *services.LoginService
	Register *services.RegisterService
	DataUser *services.UserService
}

func NewBackendManager(db *database.MemoryDB) *BackendManager {
	return &BackendManager{
		Login:    services.NewLoginService(db),
		Register: services.NewRegisterService(db),
		DataUser: services.NewUserService(db),
	}
}
