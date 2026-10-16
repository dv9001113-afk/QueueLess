package com.queueless.repository;

import com.queueless.model.OrganizationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationRepository extends JpaRepository<OrganizationEntity, String> {
    List<OrganizationEntity> findBySector(String sector);
}
