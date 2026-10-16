package com.queueless.repository;

import com.queueless.model.QueueTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueTokenRepository extends JpaRepository<QueueTokenEntity, Long> {
    Optional<QueueTokenEntity> findByTokenNumber(String tokenNumber);
    List<QueueTokenEntity> findByStatus(String status);
    List<QueueTokenEntity> findByOrganizationId(String organizationId);
    List<QueueTokenEntity> findByOrganizationIdAndStatus(String organizationId, String status);
}
