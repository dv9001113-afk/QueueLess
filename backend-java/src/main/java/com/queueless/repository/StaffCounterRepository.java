package com.queueless.repository;

import com.queueless.model.StaffCounterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffCounterRepository extends JpaRepository<StaffCounterEntity, Long> {
    List<StaffCounterEntity> findByOrganizationId(String organizationId);
    List<StaffCounterEntity> findByStatus(String status);
}
