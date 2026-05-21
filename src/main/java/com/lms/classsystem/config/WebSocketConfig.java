package com.lms.classsystem.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket & STOMP message broker configuration.
 *
 * STOMP endpoint : ws://localhost:8080/ws-chat  (SockJS fallback enabled)
 * App prefix     : /app  (routes to @MessageMapping methods in controllers)
 * Broker prefix  : /topic  (simple in-memory pub/sub broker)
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable a simple in-memory broker for /topic/... destinations
        registry.enableSimpleBroker("/topic");
        // Client-sent messages must be prefixed with /app
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
            .addEndpoint("/ws-chat")
            // Allow the Vite dev server origin; tighten to your domain in production
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}
