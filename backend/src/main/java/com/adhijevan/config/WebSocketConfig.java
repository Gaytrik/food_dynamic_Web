package com.adhijevan.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // destinations the client SUBSCRIBES to
        config.enableSimpleBroker("/topic", "/queue");
        // destinations the client SENDS to (e.g. /app/...)
        config.setApplicationDestinationPrefixes("/app");
        // enable per-user queues: /user/queue/...
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")   // tighten in prod
                .withSockJS();                   // fallback for older browsers
    }
}
