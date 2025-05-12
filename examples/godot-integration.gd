# Godot Integration Example
# This script demonstrates how to integrate a Godot game with the Mutable SDK

extends Node

# Variables to store player and session information
var player_info = null
var session_id = null
var score = 0
var game_duration = 0
var timer = 0

# Called when the node enters the scene tree for the first time
func _ready():
    # Set up communication with the Mutable SDK
    JavaScript.create_callback(self, "receive_message_from_sdk")
    
    # Signal that the game is ready to receive player info
    send_message_to_sdk("game_ready", {})

# Process function to update game time
func _process(delta):
    if session_id != null:
        timer += delta
        game_duration = int(timer)
        
        # Update score display
        $UI/ScoreLabel.text = "Score: " + str(score)
        $UI/TimeLabel.text = "Time: " + str(game_duration) + "s"

# Function to handle messages from the SDK
func receive_message_from_sdk(message_type, data_json):
    var data = JSON.parse(data_json).result
    
    match message_type:
        "SetPlayerInfo":
            handle_player_info(data)
        "SetSessionInfo":
            handle_session_info(data)
        "UpdateTimeRemaining":
            handle_time_update(data)
        _:
            print("Unknown message type: ", message_type)

# Handle player information received from SDK
func handle_player_info(data):
    player_info = data
    print("Player info received: ", player_info.name)
    
    # Update UI with player name
    $UI/PlayerNameLabel.text = "Player: " + player_info.name

# Handle session information received from SDK
func handle_session_info(data):
    session_id = data.sessionId
    print("Session started: ", session_id)
    
    # Start the game
    start_game()

# Handle time update from SDK
func handle_time_update(data):
    var time_remaining = data.time
    $UI/TimeRemainingLabel.text = "Time Remaining: " + str(time_remaining)
    
    if time_remaining <= 0:
        end_game()

# Start the game
func start_game():
    score = 0
    timer = 0
    $GameElements.visible = true
    $UI/GameOverPanel.visible = false

# End the game
func end_game():
    $GameElements.visible = false
    $UI/GameOverPanel.visible = true
    $UI/GameOverPanel/FinalScoreLabel.text = "Final Score: " + str(score)
    
    # Send game end data to SDK
    send_message_to_sdk("endGame", {
        "finalScore": score,
        "gameDuration": game_duration
    })

# Function to send messages to the SDK
func send_message_to_sdk(message_type, data):
    var json_data = JSON.print(data)
    JavaScript.eval("window.mutableReceiveMessage('" + message_type + "', '" + json_data + "')")

# Function called when player collects a coin
func _on_coin_collected(coin_value):
    score += coin_value
    send_message_to_sdk("game_event", {
        "type": "score_update",
        "score": score
    })

# Function called when player clicks the end game button
func _on_end_game_button_pressed():
    end_game()
