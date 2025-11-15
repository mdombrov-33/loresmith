package utils

import (
	"encoding/json"
	"fmt"
	"strconv"
)

// * int64Ptr returns a pointer to an int64
func Int64Ptr(i int64) *int64 {
	return &i
}

// * parseIntFromDetails parses an int from the lore details map with a default fallback
func ParseIntFromDetails(details map[string]interface{}, key string, defaultVal int) int {
	if val, ok := details[key]; ok {
		if parsed, err := strconv.Atoi(fmt.Sprintf("%v", val)); err == nil {
			return parsed
		}
	}
	return defaultVal
}

// * getStringFromDetails retrieves a string from the lore details map
func GetStringFromDetails(details map[string]interface{}, key string) string {
	if val, ok := details[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

// * getFlawJSONFromDetails retrieves the flaw object and serializes it to JSON string
// If flaw is already a string (legacy), returns it as-is
// If flaw is an object, marshals it to JSON
func GetFlawJSONFromDetails(details map[string]interface{}) string {
	if val, ok := details["flaw"]; ok {
		// If it's already a string (legacy format), return as-is
		if str, ok := val.(string); ok {
			return str
		}
		// If it's an object (new format), marshal to JSON
		if flawObj, ok := val.(map[string]interface{}); ok {
			if jsonBytes, err := json.Marshal(flawObj); err == nil {
				return string(jsonBytes)
			}
		}
	}
	return ""
}
