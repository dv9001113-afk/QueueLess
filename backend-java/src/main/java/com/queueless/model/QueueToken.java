package com.queueless.model;

import java.time.LocalDateTime;

/**
 * QueueToken Entity representing an appointment or walk-in queue ticket.
 */
public class QueueToken {

    public enum TokenType {
        APPOINTMENT,
        WALK_IN,
        PRIORITY
    }

    public enum TokenStatus {
        BOOKED,
        QUEUED,
        CALLED,
        IN_SERVICE,
        COMPLETED,
        NO_SHOW,
        CANCELLED
    }

    private Long id;
    private String tokenNumber;
    private String userName;
    private String userPhone;
    private Long serviceId;
    private Long counterId;
    private TokenType tokenType;
    private TokenStatus status;
    private LocalDateTime slotTime;
    private LocalDateTime checkInTime;
    private LocalDateTime calledAt;
    private LocalDateTime completedAt;
    private int missedCount;
    private LocalDateTime createdAt;

    public QueueToken() {
        this.createdAt = LocalDateTime.now();
        this.missedCount = 0;
        this.status = TokenStatus.QUEUED;
    }

    public QueueToken(Long id, String tokenNumber, String userName, String userPhone, Long serviceId, TokenType tokenType) {
        this();
        this.id = id;
        this.tokenNumber = tokenNumber;
        this.userName = userName;
        this.userPhone = userPhone;
        this.serviceId = serviceId;
        this.tokenType = tokenType;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public Long getCounterId() { return counterId; }
    public void setCounterId(Long counterId) { this.counterId = counterId; }

    public TokenType getTokenType() { return tokenType; }
    public void setTokenType(TokenType tokenType) { this.tokenType = tokenType; }

    public TokenStatus getStatus() { return status; }
    public void setStatus(TokenStatus status) { this.status = status; }

    public LocalDateTime getSlotTime() { return slotTime; }
    public void setSlotTime(LocalDateTime slotTime) { this.slotTime = slotTime; }

    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }

    public LocalDateTime getCalledAt() { return calledAt; }
    public void setCalledAt(LocalDateTime calledAt) { this.calledAt = calledAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public int getMissedCount() { return missedCount; }
    public void setMissedCount(int missedCount) { this.missedCount = missedCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
