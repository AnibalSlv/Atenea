package database

import "fmt"

type ParentData struct {
	Name             string `json:"name"`
	Id               int    `json:"Id"`
	LevelInstruction string `json:"levelInstruction"`
	Occupation       string `json:"occupation"`
	Workplace        string `json:"workplace"`
	AddressWork      string `json:"addressWork"`
	Telf             string `json:"telf"`
	Email            string `json:"email"`
}

type MedicalData struct {
	Fever       string `json:"fever"`
	Allergy     string `json:"allergy"`
	Diagnosis   string `json:"diagnosis"`
	Doctor      string `json:"doctor"`
	DoctorTelf  string `json:"doctorTelf"`
	SupportTeam string `json:"supportTeam"`
}

type HousingData struct {
	Situation     string `json:"situation"` // Alquilada, Rentada, Otro
	Rooms         int    `json:"rooms"`
	WallsMaterial string `json:"wallsMaterial"`
	RoofMaterial  string `json:"roofMaterial"`
}

type ServicesData struct {
	Water      bool   `json:"water"`
	Light      bool   `json:"light"`
	Drain      bool   `json:"drain"`
	Telf       bool   `json:"telf"`
	Wifi       bool   `json:"wifi"`
	Cleaning   bool   `json:"cleaning"`
	WaterDrink string `json:"waterDrink"`
	Gas        bool   `json:"gas"`
}

type Student struct {
	Date           string `json:"date"`
	IdSchool       int    `json:"idSchool"`
	Name           string `json:"name"`
	LastName       string `json:"lastName"`
	Birthplace     string `json:"birthplace"`
	DateBirth      string `json:"dateBirth"`
	Age            int    `json:"age"`
	Nationality    string `json:"nationality"`
	Address        string `json:"address"`
	Grade          string `json:"grade"`
	Section        string `json:"section"`
	Note           string `json:"note"`
	Right          bool   `json:"right"`
	Left           bool   `json:"left"`
	InstitutionOld string `json:"institutionOld"`

	Medical        MedicalData `json:"medical"`
	Mother         ParentData  `json:"mother"`
	Father         ParentData  `json:"father"`
	Representative ParentData  `json:"representative"`

	StreetLeader    string `json:"streetLeader"`
	AddressHome     string `json:"addressHome"`
	AddressVote     string `json:"addressVote"`
	CoupleSituation string `json:"coupleSituation"`

	Housing HousingData `json:"housing"`

	InhabitantNumber int `json:"inhabitantNumber"`
	InhabitantFamily int `json:"inhabitantFamily"`
	BrothersNumber   int `json:"brothersNumber"`

	Services ServicesData `json:"services"`

	Bathrooms     bool `json:"bathrooms"`
	Toilet        bool `json:"toilet"`
	Shower        bool `json:"shower"`
	Sink          bool `json:"sink"`
	CommunityActv bool `json:"communityActv"`
	SchoolAct     bool `json:"schoolAct"`
}

var listStudent []Student

func (db *MemoryDB) AddStudent(student Student) {
	listStudent = append(listStudent, student)

	for i := range len(listStudent) {
		fmt.Printf("%v", listStudent[i])
	}

	fmt.Println("---- Estudiante Guardado ---")
}
