package utils

import (
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
