package main

import (
	"embed"

	"atenea/backend"
	"atenea/backend/database"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()

	// Instancia el BackendManager para separar y facilitar la comunicacion entre el back y el front
	databaseTemp := database.NewMemoryDB()
	BackendManager := backend.NewBackendManager(databaseTemp)

	err := wails.Run(&options.App{
		Title:  "Atenea",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,

		// Le indica a Wails que Struct deben de quedar expuestos para utilizar en el front
		Bind: []interface{}{
			app,
			BackendManager,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
