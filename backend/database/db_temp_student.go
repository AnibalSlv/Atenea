package database

type ParentData struct {
	Name             string
	CI               int
	LevelInstruction string
	Occupation       string
	Workplace        string
	AddressWork      string
	Telf             string
	Email            string
}

type MedicalData struct {
	Fever       string
	Allergy     string
	Diagnosis   string
	Doctor      string
	DoctorTelf  string
	SupportTeam string
}

type HousingData struct {
	Situation     string // Alquilada, Rentada, Otro
	Rooms         int
	WallsMaterial string
	RoofMaterial  string
}

type ServicesData struct {
	Water      bool
	Light      bool
	Drain      bool
	Telf       bool
	Wifi       bool
	Cleaning   bool
	WaterDrink string
	Gas        bool
}

type Student struct {
	Name           string
	LastName       string
	Birthplace     string
	DateBirth      string
	Age            int
	Nationality    string
	Address        string
	Grade          string
	Section        string
	Note           string
	Right          bool
	Left           bool
	InstitutionOld string

	Medical        MedicalData
	Mother         ParentData
	Father         ParentData
	Representative ParentData

	StreetLeader    string
	AddressHome     string
	AddressVote     string
	CoupleSituation string

	Housing HousingData

	InhabitantNumber int
	InhabitantFamily int
	BrothersNumber   int

	Services ServicesData

	Bathrooms     bool
	Toilet        bool
	Shower        bool
	Sink          bool
	CommunityActv bool
	SchoolAct     bool
}
