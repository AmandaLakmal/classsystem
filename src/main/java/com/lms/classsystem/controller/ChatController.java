package com.lms.classsystem.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Handles real-time chat messages over STOMP/WebSocket.
 *
 * Client sends to  : /app/chat.sendMessage
 * Broadcast to     : /topic/public
 *
 * Client joins via : /app/chat.addUser
 * Broadcast to     : /topic/public
 */
@Controller
public class ChatController {

    /**
     * Receives a chat message payload, stamps it with a server-side
     * timestamp, and broadcasts it to all subscribers of /topic/public.
     *
     * Expected JSON payload:
     * { "senderName": "Jane", "content": "Hello!", "type": "CHAT" }
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public Map<String, Object> sendMessage(@Payload Map<String, Object> message) {
        message.put("timestamp", Instant.now().toEpochMilli());
        return message;
    }

    /**
     * Handles a new user joining the chat channel.
     * Records the username in the WebSocket session attributes and
     * broadcasts a JOIN event to all channel subscribers.
     *
     * Expected JSON payload:
     * { "senderName": "Jane", "type": "JOIN" }
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public Map<String, Object> addUser(
            @Payload Map<String, Object> message,
            SimpMessageHeaderAccessor headerAccessor) {

        // Store username in the WebSocket session for potential use later
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes != null) {
            sessionAttributes.put("username", message.get("senderName"));
        }

        Map<String, Object> joinEvent = new HashMap<>();
        joinEvent.put("type", "JOIN");
        joinEvent.put("senderName", message.get("senderName"));
        joinEvent.put("content", message.get("senderName") + " joined the channel.");
        joinEvent.put("timestamp", Instant.now().toEpochMilli());
        return joinEvent;
    }
}
