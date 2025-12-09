package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/mdombrov-33/loresmith/go-service/gen/lorepb"
	"github.com/mdombrov-33/loresmith/go-service/internal/store"
	"github.com/mdombrov-33/loresmith/go-service/internal/utils"
)

// * GRPCExecutor executes jobs by calling Python gRPC service
type GRPCExecutor struct {
	loreClient    lorepb.LoreServiceClient
	store         *Store
	worldStore    store.WorldStore
	portraitStore *store.PortraitStore
	logger        *log.Logger
}

// * NewGRPCExecutor creates a new gRPC-based executor
func NewGRPCExecutor(
	loreClient lorepb.LoreServiceClient,
	store *Store,
	worldStore store.WorldStore,
	portraitStore *store.PortraitStore,
	logger *log.Logger,
) *GRPCExecutor {
	return &GRPCExecutor{
		loreClient:    loreClient,
		store:         store,
		worldStore:    worldStore,
		portraitStore: portraitStore,
		logger:        logger,
	}
}

// * Execute processes a job by calling the appropriate gRPC method
func (e *GRPCExecutor) Execute(ctx context.Context, job *Job) error {
	//* Update status to processing
	e.store.Update(ctx, job.ID, JobUpdate{
		Status:   JobStatusProcessing,
		Progress: intPtr(0),
		Message:  "Preparing your request...",
	})

	//* Set timeout for generation (2 minutes - gives buffer for slower LLM responses)
	ctx, cancel := context.WithTimeout(ctx, 2*time.Minute)
	defer cancel()

	var result interface{}
	var err error

	//* Route to appropriate handler based on job type
	switch job.Type {
	case JobTypeGenerateCharacters:
		result, err = e.generateCharacters(ctx, job)
	case JobTypeGenerateFactions:
		result, err = e.generateFactions(ctx, job)
	case JobTypeGenerateSettings:
		result, err = e.generateSettings(ctx, job)
	case JobTypeGenerateEvents:
		result, err = e.generateEvents(ctx, job)
	case JobTypeGenerateRelics:
		result, err = e.generateRelics(ctx, job)
	case JobTypeCreateWorld:
		result, err = e.createWorld(ctx, job)
	default:
		return fmt.Errorf("unknown job type: %s", job.Type)
	}

	if err != nil {
		e.store.Update(ctx, job.ID, JobUpdate{
			Status:  JobStatusFailed,
			Error:   err.Error(),
			Message: fmt.Sprintf("Job failed: %s", err.Error()),
		})
		return err
	}

	//* Job completed successfully
	e.store.Update(ctx, job.ID, JobUpdate{
		Status:   JobStatusCompleted,
		Progress: intPtr(100),
		Message:  "Job completed successfully",
		Result:   result,
	})

	return nil
}

func (e *GRPCExecutor) generateCharacters(ctx context.Context, job *Job) (interface{}, error) {
	theme := e.getStringPayload(job, "theme", "fantasy")
	count := int32(e.getIntPayload(job, "count", 3))

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(20),
		Message:  "Generating characters...",
	})

	//* Call streaming gRPC method
	stream, err := e.loreClient.GenerateCharacters(ctx, &lorepb.CharactersRequest{
		Theme: theme,
		Count: count,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate characters - please try again")
	}

	//* Receive progress updates and final result from stream
	var finalResponse *lorepb.CharactersResponse
	for {
		msg, err := stream.Recv()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return nil, fmt.Errorf("failed to generate characters - please try again")
		}

		switch resp := msg.Response.(type) {
		case *lorepb.CharactersStreamResponse_Progress:
			//* Update job progress from Python's real generation progress
			e.store.Update(ctx, job.ID, JobUpdate{
				Progress: intPtr(int(resp.Progress.Progress)),
				Message:  resp.Progress.Message,
			})
		case *lorepb.CharactersStreamResponse_Final:
			//* Received final result
			finalResponse = resp.Final
		}
	}

	if finalResponse == nil {
		return nil, fmt.Errorf("failed to generate characters - no result received")
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(90),
		Message:  "Finalizing characters...",
	})

	//* Deserialize to frontend format
	characters := make([]map[string]any, len(finalResponse.Characters))
	for i, piece := range finalResponse.Characters {
		characters[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     e.deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	return characters, nil
}

func (e *GRPCExecutor) generateFactions(ctx context.Context, job *Job) (interface{}, error) {
	theme := e.getStringPayload(job, "theme", "fantasy")
	count := int32(e.getIntPayload(job, "count", 3))

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(20),
		Message:  "Generating factions...",
	})

	//* Call streaming gRPC method
	stream, err := e.loreClient.GenerateFactions(ctx, &lorepb.FactionsRequest{
		Theme: theme,
		Count: count,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate factions - please try again")
	}

	//* Receive progress updates and final result from stream
	var finalResponse *lorepb.FactionsResponse
	for {
		msg, err := stream.Recv()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return nil, fmt.Errorf("failed to generate factions - please try again")
		}

		switch resp := msg.Response.(type) {
		case *lorepb.FactionsStreamResponse_Progress:
			//* Update job progress from Python's real generation progress
			e.store.Update(ctx, job.ID, JobUpdate{
				Progress: intPtr(int(resp.Progress.Progress)),
				Message:  resp.Progress.Message,
			})
		case *lorepb.FactionsStreamResponse_Final:
			//* Received final result
			finalResponse = resp.Final
		}
	}

	if finalResponse == nil {
		return nil, fmt.Errorf("failed to generate factions - no result received")
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(90),
		Message:  "Finalizing factions...",
	})

	//* Deserialize to frontend format
	factions := make([]map[string]any, len(finalResponse.Factions))
	for i, piece := range finalResponse.Factions {
		factions[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     e.deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	return factions, nil
}

func (e *GRPCExecutor) generateSettings(ctx context.Context, job *Job) (interface{}, error) {
	theme := e.getStringPayload(job, "theme", "fantasy")
	count := int32(e.getIntPayload(job, "count", 3))

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(20),
		Message:  "Generating settings...",
	})

	//* Call streaming gRPC method
	stream, err := e.loreClient.GenerateSettings(ctx, &lorepb.SettingsRequest{
		Theme: theme,
		Count: count,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate settings - please try again")
	}

	//* Receive progress updates and final result from stream
	var finalResponse *lorepb.SettingsResponse
	for {
		msg, err := stream.Recv()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return nil, fmt.Errorf("failed to generate settings - please try again")
		}

		switch resp := msg.Response.(type) {
		case *lorepb.SettingsStreamResponse_Progress:
			//* Update job progress from Python's real generation progress
			e.store.Update(ctx, job.ID, JobUpdate{
				Progress: intPtr(int(resp.Progress.Progress)),
				Message:  resp.Progress.Message,
			})
		case *lorepb.SettingsStreamResponse_Final:
			//* Received final result
			finalResponse = resp.Final
		}
	}

	if finalResponse == nil {
		return nil, fmt.Errorf("failed to generate settings - no result received")
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(90),
		Message:  "Finalizing settings...",
	})

	//* Deserialize to frontend format
	settings := make([]map[string]any, len(finalResponse.Settings))
	for i, piece := range finalResponse.Settings {
		settings[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     e.deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	return settings, nil
}

func (e *GRPCExecutor) generateEvents(ctx context.Context, job *Job) (interface{}, error) {
	theme := e.getStringPayload(job, "theme", "fantasy")
	count := int32(e.getIntPayload(job, "count", 3))

	//* Convert selected setting to gRPC format
	var selectedSetting *lorepb.LorePiece
	if settingData, ok := job.Payload["selectedSetting"].(map[string]interface{}); ok {
		selectedSetting = e.mapToLorePiece(settingData)
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(20),
		Message:  "Generating events...",
	})

	//* Call streaming gRPC method
	stream, err := e.loreClient.GenerateEvents(ctx, &lorepb.EventsRequest{
		Theme:           theme,
		Count:           count,
		SelectedSetting: selectedSetting,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate events - please try again")
	}

	//* Receive progress updates and final result from stream
	var finalResponse *lorepb.EventsResponse
	for {
		msg, err := stream.Recv()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return nil, fmt.Errorf("failed to generate events - please try again")
		}

		switch resp := msg.Response.(type) {
		case *lorepb.EventsStreamResponse_Progress:
			//* Update job progress from Python's real generation progress
			e.store.Update(ctx, job.ID, JobUpdate{
				Progress: intPtr(int(resp.Progress.Progress)),
				Message:  resp.Progress.Message,
			})
		case *lorepb.EventsStreamResponse_Final:
			//* Received final result
			finalResponse = resp.Final
		}
	}

	if finalResponse == nil {
		return nil, fmt.Errorf("failed to generate events - no result received")
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(90),
		Message:  "Finalizing events...",
	})

	//* Deserialize to frontend format
	events := make([]map[string]any, len(finalResponse.Events))
	for i, piece := range finalResponse.Events {
		events[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     e.deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	return events, nil
}

func (e *GRPCExecutor) generateRelics(ctx context.Context, job *Job) (interface{}, error) {
	theme := e.getStringPayload(job, "theme", "fantasy")
	count := int32(e.getIntPayload(job, "count", 3))

	//* Convert selected setting and event to gRPC format
	var selectedSetting *lorepb.LorePiece
	if settingData, ok := job.Payload["selectedSetting"].(map[string]interface{}); ok {
		selectedSetting = e.mapToLorePiece(settingData)
	}

	var selectedEvent *lorepb.LorePiece
	if eventData, ok := job.Payload["selectedEvent"].(map[string]interface{}); ok {
		selectedEvent = e.mapToLorePiece(eventData)
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(20),
		Message:  "Generating relics...",
	})

	//* Call streaming gRPC method
	stream, err := e.loreClient.GenerateRelics(ctx, &lorepb.RelicsRequest{
		Theme:           theme,
		Count:           count,
		SelectedSetting: selectedSetting,
		SelectedEvent:   selectedEvent,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate relics - please try again")
	}

	//* Receive progress updates and final result from stream
	var finalResponse *lorepb.RelicsResponse
	for {
		msg, err := stream.Recv()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return nil, fmt.Errorf("failed to generate relics - please try again")
		}

		switch resp := msg.Response.(type) {
		case *lorepb.RelicsStreamResponse_Progress:
			//* Update job progress from Python's real generation progress
			e.store.Update(ctx, job.ID, JobUpdate{
				Progress: intPtr(int(resp.Progress.Progress)),
				Message:  resp.Progress.Message,
			})
		case *lorepb.RelicsStreamResponse_Final:
			//* Received final result
			finalResponse = resp.Final
		}
	}

	if finalResponse == nil {
		return nil, fmt.Errorf("failed to generate relics - no result received")
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(90),
		Message:  "Finalizing relics...",
	})

	//* Deserialize to frontend format
	relics := make([]map[string]any, len(finalResponse.Relics))
	for i, piece := range finalResponse.Relics {
		relics[i] = map[string]any{
			"name":        piece.Name,
			"description": piece.Description,
			"details":     e.deserializeDetails(piece.Details),
			"type":        piece.Type,
		}
	}

	return relics, nil
}

func (e *GRPCExecutor) createWorld(ctx context.Context, job *Job) (interface{}, error) {
	theme := e.getStringPayload(job, "theme", "fantasy")
	selectedLore := job.Payload["selectedLore"]
	userID := e.getIntPayload(job, "user_id", 0)

	if userID == 0 {
		return nil, fmt.Errorf("user_id is required")
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(10),
		Message:  "Preparing world data...",
	})

	//* Convert selectedLore to gRPC format
	loreMap, ok := selectedLore.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid selectedLore format")
	}

	var character, faction, setting, event, relic *lorepb.LorePiece
	if p, ok := loreMap["character"].(map[string]interface{}); ok {
		character = e.mapToLorePiece(p)
	}
	if p, ok := loreMap["faction"].(map[string]interface{}); ok {
		faction = e.mapToLorePiece(p)
	}
	if p, ok := loreMap["setting"].(map[string]interface{}); ok {
		setting = e.mapToLorePiece(p)
	}
	if p, ok := loreMap["event"].(map[string]interface{}); ok {
		event = e.mapToLorePiece(p)
	}
	if p, ok := loreMap["relic"].(map[string]interface{}); ok {
		relic = e.mapToLorePiece(p)
	}

	grpcReq := &lorepb.FullStoryRequest{
		Pieces: &lorepb.SelectedLorePieces{
			Character: character,
			Faction:   faction,
			Setting:   setting,
			Event:     event,
			Relic:     relic,
		},
		Theme: theme,
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(20),
		Message:  "Creating world narrative...",
	})

	storyCtx, storyCancel := utils.NewGRPCContext(utils.OpGenerateFullStory)
	defer storyCancel()

	grpcResp, err := e.loreClient.GenerateFullStory(storyCtx, grpcReq)

	if err != nil {
		return nil, fmt.Errorf("failed to generate story: %w", err)
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(65),
		Message:  "Processing world data...",
	})

	//* Generate embedding (internal - users don't need to know)
	embeddingReq := &lorepb.EmbeddingRequest{
		Text: grpcResp.Story.Content,
	}

	embeddingCtx, embeddingCancel := utils.NewGRPCContext(utils.OpGenerateEmbedding)
	defer embeddingCancel()

	embeddingResp, err := e.loreClient.GenerateEmbedding(embeddingCtx, embeddingReq)
	if err != nil {
		e.logger.Printf("WARN: Failed to generate embedding, continuing without: %v", err)
		embeddingResp = nil
	}

	var embedding []float32
	if embeddingResp != nil && len(embeddingResp.Embedding) > 0 {
		embedding = embeddingResp.Embedding
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(75),
		Message:  "Saving world to database...",
	})

	//* Create world in database
	worldID, err := e.worldStore.CreateWorldWithEmbedding(userID, theme, grpcResp.Story, "draft", embedding)
	if err != nil {
		return nil, fmt.Errorf("failed to save draft world: %w", err)
	}

	e.store.Update(ctx, job.ID, JobUpdate{
		Progress: intPtr(85),
		Message:  "Uploading character portraits...",
	})

	//* Upload character portraits to R2
	world, err := e.worldStore.GetWorldById(worldID)
	if err != nil {
		e.logger.Printf("WARN: Failed to get world for R2 upload: %v", err)
	} else if world != nil {
		for _, piece := range world.LorePieces {
			if piece.Type == "character" {
				uuid, ok := piece.Details["uuid"].(string)
				if !ok || uuid == "" {
					continue
				}

				portraitCtx, portraitCancel := context.WithTimeout(context.Background(), 5*time.Second)
				base64Data, err := e.portraitStore.GetPortrait(portraitCtx, uuid)
				portraitCancel()

				if err != nil || base64Data == "" {
					e.logger.Printf("WARN: Portrait not ready for %s (UUID: %s)", piece.Name, uuid)
					continue
				}

				uploadCtx, uploadCancel := utils.NewGRPCContext(utils.OpUploadImage)
				uploadResp, err := e.loreClient.UploadImageToR2(uploadCtx, &lorepb.UploadImageRequest{
					ImageBase64: base64Data,
					WorldId:     int64(worldID),
					CharacterId: strconv.Itoa(piece.ID),
					ImageType:   "portrait",
				})
				uploadCancel()

				if err != nil {
					e.logger.Printf("ERROR: Failed to upload portrait for %s: %v", piece.Name, err)
					continue
				}

				piece.Details["image_portrait"] = uploadResp.ImageUrl
				delete(piece.Details, "uuid")

				if err := e.worldStore.UpdateLorePieceDetails(piece.ID, piece.Details); err != nil {
					e.logger.Printf("ERROR: Failed to update lore piece: %v", err)
				}
			}
		}
	}

	result := map[string]interface{}{
		"world_id": worldID,
	}

	return result, nil
}

// * Helper functions to extract payload values
func (e *GRPCExecutor) getStringPayload(job *Job, key string, defaultValue string) string {
	if val, ok := job.Payload[key].(string); ok {
		return val
	}
	return defaultValue
}

func (e *GRPCExecutor) getIntPayload(job *Job, key string, defaultValue int) int {
	if val, ok := job.Payload[key].(float64); ok {
		return int(val)
	}
	if val, ok := job.Payload[key].(int); ok {
		return val
	}
	return defaultValue
}

func (e *GRPCExecutor) mapToLorePiece(m map[string]interface{}) *lorepb.LorePiece {
	if m == nil {
		return nil
	}

	details := make(map[string]string)
	if d, ok := m["details"].(map[string]interface{}); ok {
		for k, v := range d {
			if s, ok := v.(string); ok {
				details[k] = s
			} else {
				jsonBytes, _ := json.Marshal(v)
				details[k] = string(jsonBytes)
			}
		}
	}

	name, _ := m["name"].(string)
	description, _ := m["description"].(string)
	pieceType, _ := m["type"].(string)

	return &lorepb.LorePiece{
		Name:        name,
		Description: description,
		Details:     details,
		Type:        pieceType,
	}
}

func (e *GRPCExecutor) deserializeDetails(details map[string]string) map[string]any {
	result := make(map[string]any)
	for key, value := range details {
		var parsed interface{}
		if err := json.Unmarshal([]byte(value), &parsed); err == nil {
			//* Successfully parsed - it was a JSON string
			result[key] = parsed
		} else {
			//* Not JSON - keep as string
			result[key] = value
		}
	}
	return result
}

// * intPtr is a helper to create int pointers for JobUpdate.Progress
func intPtr(i int) *int {
	return &i
}
