package store

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type PortraitStore struct {
	redis *redis.Client
}

func NewPortraitStore(redis *redis.Client) *PortraitStore {
	return &PortraitStore{redis: redis}
}

func (s *PortraitStore) GetPortrait(ctx context.Context, uuid string) (string, error) {
	key := fmt.Sprintf("portrait:%s", uuid)
	val, err := s.redis.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("failed to get portrait from Redis: %w", err)
	}
	return val, nil
}
