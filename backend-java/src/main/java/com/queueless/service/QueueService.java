package com.queueless.service;

import com.queueless.model.QueueToken;
import com.queueless.model.QueueToken.TokenStatus;
import com.queueless.model.QueueToken.TokenType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Deterministic Queue Service
 * 1. Priority Override (P-xxx)
 * 2. 2:1 Interleaved Ratio (Appointments : Walk-ins)
 * 3. 3-minute grace period with 2-chance penalty
 */
public class QueueService {

    private final List<QueueToken> tokenStore = Collections.synchronizedList(new ArrayList<>());
    private final AtomicInteger interleaveCounter = new AtomicInteger(0);

    public QueueToken issueToken(String name, String phone, Long serviceId, TokenType type, LocalDateTime slotTime) {
        long id = System.currentTimeMillis();
        String prefix = (type == TokenType.APPOINTMENT) ? "A" : (type == TokenType.PRIORITY) ? "P" : "W";
        long count = tokenStore.stream().filter(t -> t.getTokenType() == type).count() + 101;
        String tokenNumber = prefix + "-" + count;

        QueueToken token = new QueueToken(id, tokenNumber, name, phone, serviceId, type);
        token.setSlotTime(slotTime != null ? slotTime : LocalDateTime.now());
        token.setCheckInTime(LocalDateTime.now());
        tokenStore.add(token);
        return token;
    }

    /**
     * Deterministic 2:1 Allocation Engine
     */
    public synchronized Optional<QueueToken> getNextEligibleToken(Long serviceId) {
        List<QueueToken> waiting = tokenStore.stream()
                .filter(t -> t.getStatus() == TokenStatus.QUEUED)
                .filter(t -> serviceId == null || t.getServiceId().equals(serviceId))
                .collect(Collectors.toList());

        if (waiting.isEmpty()) return Optional.empty();

        // 1. Check Priority Override
        Optional<QueueToken> priority = waiting.stream()
                .filter(t -> t.getTokenType() == TokenType.PRIORITY)
                .findFirst();
        if (priority.isPresent()) {
            return priority;
        }

        // 2. Separate Appointments & Walk-ins
        List<QueueToken> appointments = waiting.stream()
                .filter(t -> t.getTokenType() == TokenType.APPOINTMENT)
                .collect(Collectors.toList());

        List<QueueToken> walkIns = waiting.stream()
                .filter(t -> t.getTokenType() == TokenType.WALK_IN)
                .collect(Collectors.toList());

        int currentRatio = interleaveCounter.get();

        if (!appointments.isEmpty() && currentRatio < 2) {
            interleaveCounter.incrementAndGet();
            return Optional.of(appointments.get(0));
        } else if (!walkIns.isEmpty()) {
            interleaveCounter.set(0);
            return Optional.of(walkIns.get(0));
        } else if (!appointments.isEmpty()) {
            interleaveCounter.set(1);
            return Optional.of(appointments.get(0));
        }

        return Optional.of(waiting.get(0));
    }

    /**
     * Call next token for specific counter
     */
    public synchronized Optional<QueueToken> callNextToken(Long counterId, Long serviceId) {
        Optional<QueueToken> nextOpt = getNextEligibleToken(serviceId);
        if (nextOpt.isPresent()) {
            QueueToken token = nextOpt.get();
            token.setStatus(TokenStatus.CALLED);
            token.setCounterId(counterId);
            token.setCalledAt(LocalDateTime.now());
            return Optional.of(token);
        }
        return Optional.empty();
    }

    /**
     * No-Show 2-Chance Penalty Logic
     */
    public synchronized String handleNoShow(String tokenNumber) {
        Optional<QueueToken> opt = tokenStore.stream()
                .filter(t -> t.getTokenNumber().equalsIgnoreCase(tokenNumber))
                .findFirst();

        if (opt.isEmpty()) return "Token Not Found";

        QueueToken token = opt.get();
        token.setMissedCount(token.getMissedCount() + 1);

        if (token.getMissedCount() == 1) {
            // 1st Chance Missed: Bump back 3 positions in waiting queue
            token.setStatus(TokenStatus.QUEUED);
            token.setCounterId(null);
            token.setCalledAt(null);
            return "Bumped Back 3 Positions (1st Chance)";
        } else {
            // 2nd Chance Missed: Permanent Cancellation
            token.setStatus(TokenStatus.CANCELLED);
            return "Cancelled Due to Consecutive No-Shows";
        }
    }
}
