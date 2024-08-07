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

func NewHandler(q *pgstore.Queries, r *chi.Mux, upgrader websocket.Upgrader) http.Handler {
	a := apiHandler{
		q:           q,
		subscribers: make(map[string]map[*websocket.Conn]context.CancelFunc),
		mu:          &sync.Mutex{},
	}

	r.Get("/subscribe/{room_id}", a.handleSubscribeToRoom)

	r.Route("/api", func(r chi.Router) {
		r.Route("/rooms", func(r chi.Router) {
			r.Post("/", a.handlePostCreateRoom)
			r.Get("/", a.handleGetRooms)

			r.Route("/{room_id}/messages", func(r chi.Router) {
				r.Post("/", a.handlePostCreateRoomMessages)
				r.Get("/", a.handleGetRoomMessages)

				r.Route("/{message_id}", func(r chi.Router) {
					r.Get("/", a.handleGetRoomMessage)
					r.Patch("/", a.handlePatchReactToMessage)
					r.Patch("/", a.handlePatchMarkMessageAsAnswered)
					r.Delete("/", a.handleDeleteReactionFromMessage)
				})

			})
		})
	})

	a.r = r
	return a
}

func (h apiHandler) handleSubscribeToRoom(w http.ResponseWriter, r *http.Request) {
	rawRoomID := chi.URLParam(r, "room_id")
	roomID, err := uuid.Parse(rawRoomID)
	if err != nil {
		http.Error(w, "Invalid room ID", http.StatusBadRequest)
		return
	}

	_, err = h.q.GetRoom(r.Context(), roomID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Room not found", http.StatusBadRequest)
			return
		}

		http.Error(w, "Something went wrong", http.StatusInternalServerError)
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

	data, err := json.Marshal(response{ID: roomID.String()})
	if err != nil {
		slog.Error("Failed to parse Response", "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-type", "application/json")
	_, err = w.Write(data)
	if err != nil {
		slog.Error("Failed to write Response", "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}
}
func (h apiHandler) handleGetRooms(w http.ResponseWriter, r *http.Request) {

}
func (h apiHandler) handlePostCreateRoomMessages(w http.ResponseWriter, r *http.Request) {

}
func (h apiHandler) handleGetRoomMessages(w http.ResponseWriter, r *http.Request) {

}
func (h apiHandler) handleGetRoomMessage(w http.ResponseWriter, r *http.Request) {

}
func (h apiHandler) handlePatchReactToMessage(w http.ResponseWriter, r *http.Request) {

}
func (h apiHandler) handlePatchMarkMessageAsAnswered(w http.ResponseWriter, r *http.Request) {

}
func (h apiHandler) handleDeleteReactionFromMessage(w http.ResponseWriter, r *http.Request) {

}
