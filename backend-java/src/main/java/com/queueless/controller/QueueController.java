package com.queueless.controller;

import com.queueless.model.QueueToken;
import com.queueless.model.QueueToken.TokenType;
import com.queueless.service.QueueService;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Spring Boot REST Controller for QueueLess
 * Endpoints for Token Generation, Next Token Dispatching, and No-Show Handling
 */
public class QueueController {

    private final QueueService queueService;

    public QueueController() {
        this.queueService = new QueueService();
    }

    // POST /api/tokens/issue
    public Map<String, Object> issueToken(String name, String phone, Long serviceId, String typeStr) {
        TokenType type = TokenType.valueOf(typeStr.toUpperCase());
        QueueToken token = queueService.issueToken(name, phone, serviceId, type, null);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("tokenNumber", token.getTokenNumber());
        response.put("tokenType", token.getTokenType());
        response.put("status", token.getStatus());
        return response;
    }

    // POST /api/counters/{id}/call-next
    public Map<String, Object> callNext(Long counterId, Long serviceId) {
        Optional<QueueToken> called = queueService.callNextToken(counterId, serviceId);
        Map<String, Object> response = new HashMap<>();

        if (called.isPresent()) {
            response.put("success", true);
            response.put("token", called.get());
        } else {
            response.put("success", false);
            response.put("message", "Queue is currently empty");
        }
        return response;
    }

    // POST /api/counters/{id}/no-show
    public Map<String, Object> markNoShow(String tokenNumber) {
        String result = queueService.handleNoShow(tokenNumber);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("result", result);
        return response;
    }
}
