package utils

import (
	"context"
	"time"
)

type OperationType string

const (
	//* LLM generation operations (slowest)
	OpGenerateLore       OperationType = "generate_lore"        //* 3 minutes - multiple LLM calls
	OpGenerateFullStory  OperationType = "generate_full_story"  //* 3 minutes - full quest generation
	OpGenerateSceneBatch OperationType = "generate_scene_batch" //* 3 minutes - multiple scenes with branches

	//* Medium operations
	OpGenerateBeats     OperationType = "generate_beats"     //* 1 minute - expand scene beats
	OpGenerateCompanion OperationType = "generate_companion" //* 1 minute - single character
	OpGenerateInventory OperationType = "generate_inventory" //* 1 minute - 3-5 items
	OpRerank            OperationType = "rerank"             //* 1 minute - rerank search results

	//* Quick operations
	OpGenerateConsequence OperationType = "generate_consequence" //* 30 seconds - single outcome
	OpGenerateEmbedding   OperationType = "generate_embedding"   //* 30 seconds - embedding generation
)

var operationTimeouts = map[OperationType]time.Duration{
	//* Slow operations (3 minutes)
	OpGenerateLore:       3 * time.Minute,
	OpGenerateFullStory:  3 * time.Minute,
	OpGenerateSceneBatch: 3 * time.Minute,

	//* Medium operations (1 minute)
	OpGenerateBeats:     1 * time.Minute,
	OpGenerateCompanion: 1 * time.Minute,
	OpGenerateInventory: 1 * time.Minute,
	OpRerank:            1 * time.Minute,

	//* Quick operations (30 seconds)
	OpGenerateConsequence: 30 * time.Second,
	OpGenerateEmbedding:   30 * time.Second,
}

// NewGRPCContext creates a context with appropriate timeout for the operation type.
// We always defer the returned cancel function to prevent memory leaks.
//
// Example:
//
//	ctx, cancel := utils.NewGRPCContext(utils.OpGenerateLore)
//	defer cancel()
//	resp, err := client.GenerateCharacters(ctx, req)
func NewGRPCContext(opType OperationType) (context.Context, context.CancelFunc) {
	timeout, exists := operationTimeouts[opType]
	if !exists {
		//* Default to 3 minutes for unknown operations
		timeout = 3 * time.Minute
	}

	return context.WithTimeout(context.Background(), timeout)
}

// NewGRPCContextWithTimeout creates a context with a custom timeout.
// Use this for one-off operations that need a specific timeout.
//
// Example:
//
//	ctx, cancel := utils.NewGRPCContextWithTimeout(5 * time.Minute)
//	defer cancel()
func NewGRPCContextWithTimeout(timeout time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), timeout)
}
