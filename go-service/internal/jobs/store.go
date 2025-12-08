package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	jobKeyPrefix = "job:"
	jobTTL       = 24 * time.Hour //* 24 hours
)

type Store struct {
	redis *redis.Client
}

func NewStore(redisClient *redis.Client) *Store {
	return &Store{redis: redisClient}
}

// * Create stores a new job in Redis
func (s *Store) Create(ctx context.Context, job *Job) error {
	key := s.jobKey(job.ID)
	data, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to marshal job: %w", err)
	}

	err = s.redis.Set(ctx, key, data, jobTTL).Err()
	if err != nil {
		return fmt.Errorf("failed to store job in Redis: %w", err)
	}

	return nil
}

// * Get retrieves a job from Redis
func (s *Store) Get(ctx context.Context, jobID string) (*Job, error) {
	key := s.jobKey(jobID)
	data, err := s.redis.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, fmt.Errorf("job not found: %s", jobID)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get job from Redis: %w", err)
	}

	var job Job
	if err := json.Unmarshal([]byte(data), &job); err != nil {
		return nil, fmt.Errorf("failed to unmarshal job: %w", err)
	}

	return &job, nil
}

// * Update updates a job's status in Redis
func (s *Store) Update(ctx context.Context, jobID string, update JobUpdate) error {
	job, err := s.Get(ctx, jobID)
	if err != nil {
		return err
	}

	if update.Status != "" {
		job.Status = update.Status
	}
	if update.Progress != nil {
		job.Progress = *update.Progress
	}
	if update.Message != "" {
		job.Message = update.Message
	}
	if update.Result != nil {
		job.Result = update.Result
	}
	if update.Error != "" {
		job.Error = update.Error
	}

	job.UpdatedAt = time.Now()

	if update.Status == JobStatusCompleted || update.Status == JobStatusFailed {
		now := time.Now()
		job.CompletedAt = &now
	}

	return s.Create(ctx, job)
}

func (s *Store) Delete(ctx context.Context, jobID string) error {
	key := s.jobKey(jobID)
	return s.redis.Del(ctx, key).Err()
}

func (s *Store) jobKey(jobID string) string {
	return fmt.Sprintf("%s%s", jobKeyPrefix, jobID)
}
