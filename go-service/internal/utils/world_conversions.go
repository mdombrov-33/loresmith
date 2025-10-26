package utils

import (
	"strconv"

	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
)

// * converts []*store.World to []*lorepb.WorldResult for reranking
func ConvertToWorldResults(worlds []*store.World) []*lorepb.WorldResult {
	results := make([]*lorepb.WorldResult, len(worlds))
	for i, world := range worlds {
		var relevance float32
		if world.Relevance != nil {
			relevance = float32(*world.Relevance)
		}
		results[i] = &lorepb.WorldResult{
			Title:     strconv.Itoa(world.ID), //* Convert int to string
			Theme:     world.Theme,
			FullStory: world.FullStory,
			Relevance: relevance,
		}
	}
	return results
}

// * converts []*lorepb.WorldResult back to []*store.World preserving original data
func ConvertFromWorldResults(reranked []*lorepb.WorldResult, originals []*store.World) []*store.World {
	results := make([]*store.World, len(reranked))

	//* Create a map of ID -> original world for quick lookup
	originalMap := make(map[int]*store.World)
	for _, world := range originals {
		originalMap[world.ID] = world
	}

	//* Reorder based on reranked results
	for i, rerankedResult := range reranked {
		if id, err := strconv.Atoi(rerankedResult.Title); err == nil {
			if original, exists := originalMap[id]; exists {
				results[i] = original
			}
		}
	}

	return results
}
