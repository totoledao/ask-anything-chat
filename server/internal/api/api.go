package api

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"sync"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5"
	"github.com/totoledao/ask-anything-chat/internal/store/pgstore"
)

type apiHandler struct {
	q           *pgstore.Queries
	r           *chi.Mux
	upgrader    websocket.Upgrader
	subscribers map[string]map[*websocket.Conn]context.CancelFunc
	mu          *sync.Mutex
}

func (h apiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.r.ServeHTTP(w, r)
}

func NewHandler(q *pgstore.Queries, r *chi.Mux) http.Handler {
	a := apiHandler{
		q:           q,
		upgrader:    websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }},
		subscribers: make(map[string]map[*websocket.Conn]context.CancelFunc),
		mu:          &sync.Mutex{},
	}

	r.Get("/subscribe/{room_id}", a.handleSubscribeToRoom)

	r.Route("/api", func(r chi.Router) {
		r.Route("/rooms", func(r chi.Router) {
			r.Post("/", a.handlePostCreateRoom)
			r.Get("/", a.handleGetRooms)

			r.Route("/{room_id}/messages", func(r chi.Router) {
				r.Post("/", a.handlePostCreateRoomMessage)
				r.Get("/", a.handleGetRoomMessages)

				r.Route("/{message_id}", func(r chi.Router) {
					r.Get("/", a.handleGetRoomMessage)

					r.Route("/answer", func(r chi.Router) {
						r.Patch("/", a.handlePatchMarkMessageAsAnswered)
					})

					r.Route("/react", func(r chi.Router) {
						r.Patch("/", a.handlePatchReactToMessage)
						r.Delete("/", a.handleDeleteReactionFromMessage)
					})
				})
			})
		})
	})

	a.r = r
	return a
}

const (
	MessageKindMessageCreated          = "message_created"
	MessageKindMessageRactionIncreased = "message_reaction_increased"
	MessageKindMessageRactionDecreased = "message_reaction_decreased"
	MessageKindMessageAnswered         = "message_answered"
)

type MessageMessageReactionIncreased struct {
	ID    string `json:"id"`
	Count int64  `json:"count"`
}

type MessageMessageReactionDecreased struct {
	ID    string `json:"id"`
	Count int64  `json:"count"`
}

type MessageMessageAnswered struct {
	ID string `json:"id"`
}

type MessageMessageCreated struct {
	ID      string `json:"id"`
	Message string `json:"message"`
}

type Message struct {
	Kind   string `json:"kind"`
	Value  any    `json:"value"`
	RoomID string `json:"-"`
}

func (h apiHandler) notifyClient(msg Message) {
	h.mu.Lock()
	defer h.mu.Unlock()

	subscribers, ok := h.subscribers[msg.RoomID]
	if !ok || len(subscribers) == 0 {
		return
	}

	for conn, cancel := range subscribers {
		err := conn.WriteJSON(msg)
		if err != nil {
			slog.Error("Failed to send message to client", "error", err)
			cancel()
		}
	}
}

func (h apiHandler) checkIfRoomExists(w http.ResponseWriter, r *http.Request) (string, uuid.UUID, error) {
	rawRoomID := chi.URLParam(r, "room_id")
	roomID, err := uuid.Parse(rawRoomID)
	if err != nil {
		http.Error(w, "Invalid room ID", http.StatusBadRequest)
		return rawRoomID, roomID, err
	}

	_, err = h.q.GetRoom(r.Context(), roomID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Room not found", http.StatusBadRequest)
			return rawRoomID, roomID, err
		}

		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return rawRoomID, roomID, err
	}

	return rawRoomID, roomID, nil
}

func (h apiHandler) checkIfMessageExists(w http.ResponseWriter, r *http.Request) (string, uuid.UUID, error) {
	rawMessageID := chi.URLParam(r, "message_id")
	messageID, err := uuid.Parse(rawMessageID)
	if err != nil {
		http.Error(w, "Invalid message ID", http.StatusBadRequest)
		return rawMessageID, messageID, err
	}

	_, err = h.q.GetMessage(r.Context(), messageID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Message not found", http.StatusBadRequest)
			return rawMessageID, messageID, err
		}

		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return rawMessageID, messageID, err
	}

	return rawMessageID, messageID, nil
}

func (h apiHandler) writeJSONResponse(w http.ResponseWriter, res any, method string) {
	data, err := json.Marshal(res)
	if err != nil {
		slog.Error("Failed to parse Response for "+method, "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-type", "application/json")
	_, err = w.Write(data)
	if err != nil {
		slog.Error("Failed to write Response for "+method, "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}
}

func (h apiHandler) handleSubscribeToRoom(w http.ResponseWriter, r *http.Request) {
	rawRoomID, _, err := h.checkIfRoomExists(w, r)
	if err != nil {
		return
	}

	c, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Warn("Failed to upgrade connection", "error", err)
		http.Error(w, "Failed to upgrade to websocket connection", http.StatusBadRequest)
		return
	}

	defer c.Close()

	ctx, cancel := context.WithCancel(r.Context())

	h.mu.Lock()
	_, ok := h.subscribers[rawRoomID]
	if !ok {
		h.subscribers[rawRoomID] = make(map[*websocket.Conn]context.CancelFunc)
	}
	slog.Info("New client connected", "room_id", rawRoomID, "client_ip", r.RemoteAddr)
	h.subscribers[rawRoomID][c] = cancel
	h.mu.Unlock()

	<-ctx.Done()

	h.mu.Lock()
	delete(h.subscribers[rawRoomID], c)
	h.mu.Unlock()
}

func (h apiHandler) handlePostCreateRoom(w http.ResponseWriter, r *http.Request) {
	type _body struct {
		Theme string `json:"theme"`
	}

	var body _body
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, "Invalid json", http.StatusBadRequest)
		return
	}

	roomID, err := h.q.InsertRoom(r.Context(), body.Theme)
	if err != nil {
		slog.Error("Failed to insert Room", "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		ID string `json:"id"`
	}

	h.writeJSONResponse(w, response{ID: roomID.String()}, "handlePostCreateRoom")
}

func (h apiHandler) handleGetRooms(w http.ResponseWriter, r *http.Request) {
	rooms, err := h.q.GetRooms(r.Context())
	if err != nil {
		slog.Error("Failed to get Rooms", "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		ID    string `json:"id"`
		Theme string `json:"theme"`
	}

	res := make([]response, len(rooms))
	for i, room := range rooms {
		res[i] = response{
			ID:    room.ID.String(),
			Theme: room.Theme,
		}
	}

	h.writeJSONResponse(w, res, "handleGetRooms")
}

func (h apiHandler) handlePostCreateRoomMessage(w http.ResponseWriter, r *http.Request) {
	rawRoomID, roomID, err := h.checkIfRoomExists(w, r)
	if err != nil {
		return
	}

	type _body struct {
		Message string `json:"message"`
	}

	var body _body
	err = json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, "Invalid json", http.StatusBadRequest)
		return
	}

	messageID, err := h.q.InsertMessage(r.Context(), pgstore.InsertMessageParams{
		RoomID:  roomID,
		Message: body.Message,
	})
	if err != nil {
		slog.Error("Failed to insert message", "error", err, "message", body.Message)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		ID string `json:"id"`
	}

	h.writeJSONResponse(w, response{ID: messageID.String()}, "handlePostCreateRoomMessage")

	go h.notifyClient(Message{
		Kind:   MessageKindMessageCreated,
		RoomID: rawRoomID,
		Value: MessageMessageCreated{
			ID:      messageID.String(),
			Message: body.Message,
		},
	})
}

func (h apiHandler) handleGetRoomMessages(w http.ResponseWriter, r *http.Request) {
	_, roomID, err := h.checkIfRoomExists(w, r)
	if err != nil {
		return
	}

	messages, err := h.q.GetRoomMessages(r.Context(), roomID)
	if err != nil {
		slog.Error("Failed to get Rooms", "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		ID            string `json:"id"`
		RoomID        string `json:"room_id"`
		Message       string `json:"message"`
		ReactionCount int64  `json:"reaction_count"`
		Answered      bool   `json:"answered"`
	}

	res := make([]response, len(messages))
	for i, msg := range messages {
		res[i] = response{
			ID:            msg.ID.String(),
			RoomID:        msg.RoomID.String(),
			Message:       msg.Message,
			ReactionCount: msg.ReactionCount,
			Answered:      msg.Answered,
		}
	}

	h.writeJSONResponse(w, res, "handleGetRooms")
}

func (h apiHandler) handleGetRoomMessage(w http.ResponseWriter, r *http.Request) {
	_, _, err := h.checkIfRoomExists(w, r)
	if err != nil {
		return
	}

	_, messageID, err := h.checkIfMessageExists(w, r)
	if err != nil {
		return
	}

	message, err := h.q.GetMessage(r.Context(), messageID)
	if err != nil {
		slog.Error("Failed to add reaction to message", "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		ID            string `json:"id"`
		RoomID        string `json:"room_id"`
		Message       string `json:"message"`
		ReactionCount int64  `json:"reaction_count"`
		Answered      bool   `json:"answered"`
	}

	res := response{
		ID:            message.ID.String(),
		RoomID:        message.RoomID.String(),
		Message:       message.Message,
		ReactionCount: message.ReactionCount,
		Answered:      message.Answered,
	}
	h.writeJSONResponse(w, res, "handleGetRoomMessage")
}

func (h apiHandler) handlePatchReactToMessage(w http.ResponseWriter, r *http.Request) {
	rawRoomID, _, err := h.checkIfRoomExists(w, r)
	if err != nil {
		return
	}

	rawMessageID, messageID, err := h.checkIfMessageExists(w, r)
	if err != nil {
		return
	}

	count, err := h.q.ReactToMessage(r.Context(), messageID)
	if err != nil {
		slog.Error("Failed to add reaction to message", "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		Count int64 `json:"count"`
	}

	h.writeJSONResponse(w, response{Count: count}, "handlePatchReactToMessage")

	go h.notifyClient(Message{
		Kind:   MessageKindMessageRactionIncreased,
		RoomID: rawRoomID,
		Value: MessageMessageReactionIncreased{
			ID:    rawMessageID,
			Count: count,
		},
	})
}

func (h apiHandler) handleDeleteReactionFromMessage(w http.ResponseWriter, r *http.Request) {
	rawRoomID, _, err := h.checkIfRoomExists(w, r)
	if err != nil {
		return
	}

	rawMessageID, messageID, err := h.checkIfMessageExists(w, r)
	if err != nil {
		return
	}

	count, err := h.q.RemoveReactionFromMessage(r.Context(), messageID)
	if err != nil {
		slog.Error("Failed to delete reaction from message", "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		Count int64 `json:"count"`
	}

	h.writeJSONResponse(w, response{Count: count}, "handleDeleteReactionFromMessage")

	go h.notifyClient(Message{
		Kind:   MessageKindMessageRactionDecreased,
		RoomID: rawRoomID,
		Value: MessageMessageReactionDecreased{
			ID:    rawMessageID,
			Count: count,
		},
	})
}

func (h apiHandler) handlePatchMarkMessageAsAnswered(w http.ResponseWriter, r *http.Request) {
	rawRoomID, _, err := h.checkIfRoomExists(w, r)
	if err != nil {
		return
	}

	rawMessageID, messageID, err := h.checkIfMessageExists(w, r)
	if err != nil {
		return
	}

	err = h.q.MarkMessageAsAnswered(r.Context(), messageID)
	if err != nil {
		slog.Error("Failed to mark message as answered", "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		ID uuid.UUID `json:"id"`
	}

	h.writeJSONResponse(w, response{ID: messageID}, "handlePatchMarkMessageAsAnswered")

	go h.notifyClient(Message{
		Kind:   MessageKindMessageAnswered,
		RoomID: rawRoomID,
		Value: MessageMessageAnswered{
			ID: rawMessageID,
		},
	})
}
