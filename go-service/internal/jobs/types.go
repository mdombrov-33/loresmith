package jobs

import "time"

type JobType string

const (
	JobTypeGenerateCharacters JobType = "generate_characters"
	JobTypeGenerateFactions   JobType = "generate_factions"
	JobTypeGenerateSettings   JobType = "generate_settings"
	JobTypeGenerateEvents     JobType = "generate_events"
	JobTypeGenerateRelics     JobType = "generate_relics"
	JobTypeCreateWorld        JobType = "create_world"
	JobTypeGenerateWorldImage JobType = "generate_world_image"
)

type JobStatus string

const (
	JobStatusPending    JobStatus = "pending"
	JobStatusProcessing JobStatus = "processing"
	JobStatusCompleted  JobStatus = "completed"
	JobStatusFailed     JobStatus = "failed"
)

type Job struct {
	ID          string                 `json:"id"`
	Type        JobType                `json:"type"`
	Status      JobStatus              `json:"status"`
	Progress    int                    `json:"progress"`         //* 0-100
	Message     string                 `json:"message"`          //* Status message like "Generating characters..."
	Payload     map[string]interface{} `json:"payload"`          //* Input data
	Result      interface{}            `json:"result,omitempty"` //* Output data
	Error       string                 `json:"error,omitempty"`  //* Error message if failed
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
	CompletedAt *time.Time             `json:"completed_at,omitempty"`
}

type JobRequest struct {
	Type    JobType                `json:"type"`
	Payload map[string]interface{} `json:"payload"`
}

type JobUpdate struct {
	Status   JobStatus   `json:"status,omitempty"`
	Progress *int        `json:"progress,omitempty"` //* Pointer to distinguish nil (not set) from 0 (explicitly zero)
	Message  string      `json:"message,omitempty"`
	Result   interface{} `json:"result,omitempty"`
	Error    string      `json:"error,omitempty"`
}
