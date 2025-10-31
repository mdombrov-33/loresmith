package utils

import (
	"encoding/json"
	"net/http"
)

type ResponseEnvelope map[string]any

func WriteResponseJSON(w http.ResponseWriter, status int, data ResponseEnvelope) error {
	js, err := json.MarshalIndent(data, "", " ")
	if err != nil {
		return err
	}

	js = append(js, '\n')
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(js)
	return nil
}
