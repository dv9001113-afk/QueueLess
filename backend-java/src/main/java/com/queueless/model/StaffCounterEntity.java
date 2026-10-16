package com.queueless.model;

import jakarta.persistence.*;

@Entity
@Table(name = "staff_counters")
public class StaffCounterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "staff_user_id")
    private String staffUserId;

    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "organization_id")
    private String organizationId;

    @Column(name = "current_token")
    private String currentToken;

    @Column(nullable = false)
    private String status = "IDLE"; // IDLE, CALLING, IN_SERVICE

    @Column(name = "is_active")
    private Boolean isActive = true;

    public StaffCounterEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStaffUserId() { return staffUserId; }
    public void setStaffUserId(String staffUserId) { this.staffUserId = staffUserId; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }

    public String getCurrentToken() { return currentToken; }
    public void setCurrentToken(String currentToken) { this.currentToken = currentToken; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}
