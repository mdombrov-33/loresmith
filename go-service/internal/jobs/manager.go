package jobs

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Manager struct {
	store    *Store
	executor Executor
}

type Executor interface {
	Execute(ctx context.Context, job *Job) error
}

func NewManager(store *Store, executor Executor) *Manager {
	return &Manager{
		store:    store,
		executor: executor,
	}
}

func (m *Manager) CreateJob(ctx context.Context, req JobRequest) (*Job, error) {
	if req.Type == "" {
		return nil, fmt.Errorf("job type is required")
	}

	// Create job
	job := &Job{
		ID:        uuid.New().String(),
		Type:      req.Type,
		Status:    JobStatusPending,
		Progress:  0,
		Message:   "Job created, waiting to start...",
		Payload:   req.Payload,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := m.store.Create(ctx, job); err != nil {
		return nil, fmt.Errorf("failed to create job: %w", err)
	}

	go func() {
		ctx := context.Background()
		if err := m.executor.Execute(ctx, job); err != nil {
			m.store.Update(ctx, job.ID, JobUpdate{
				Status:  JobStatusFailed,
				Error:   err.Error(),
				Message: "Job execution failed",
			})
		}
	}()

	return job, nil
}

func (m *Manager) GetJob(ctx context.Context, jobID string) (*Job, error) {
	return m.store.Get(ctx, jobID)
}

func (m *Manager) UpdateJob(ctx context.Context, jobID string, update JobUpdate) error {
	return m.store.Update(ctx, jobID, update)
}
