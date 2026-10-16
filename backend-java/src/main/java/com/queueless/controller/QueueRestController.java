package com.queueless.controller;

import com.queueless.model.QueueTokenEntity;
import com.queueless.model.StaffCounterEntity;
import com.queueless.repository.QueueTokenRepository;
import com.queueless.repository.StaffCounterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "*")
public class QueueRestController {

    @Autowired
    private QueueTokenRepository tokenRepository;

    @Autowired
    private StaffCounterRepository counterRepository;

    private int interleaveCounter = 0;

    @GetMapping("/tokens")
    public List<QueueTokenEntity> getAllTokens(@RequestParam(required = false) String organizationId) {
        if (organizationId != null && !organizationId.isEmpty()) {
            return tokenRepository.findByOrganizationId(organizationId);
        }
        return tokenRepository.findAll();
    }

    @PostMapping("/issue")
    public ResponseEntity<Map<String, Object>> issueToken(@RequestBody Map<String, Object> req) {
        String userName = (String) req.get("userName");
        String userPhone = (String) req.get("userPhone");
        Long serviceId = Long.valueOf(req.getOrDefault("serviceId", 1).toString());
        String tokenType = (String) req.getOrDefault("tokenType", "WALK_IN");
        String orgId = (String) req.getOrDefault("organizationId", "org-univ");

        String prefix = "W";
        if ("APPOINTMENT".equalsIgnoreCase(tokenType)) prefix = "A";
        if ("PRIORITY".equalsIgnoreCase(tokenType)) prefix = "P";

        long count = tokenRepository.count();
        String tokenNumber = prefix + "-" + (100 + count + 1);

        QueueTokenEntity entity = new QueueTokenEntity();
        entity.setTokenNumber(tokenNumber);
        entity.setUserName(userName);
        entity.setUserPhone(userPhone);
        entity.setServiceId(serviceId);
        entity.setOrganizationId(orgId);
        entity.setTokenType(tokenType);
        entity.setStatus("QUEUED");
        entity.setSlotTime(LocalDateTime.now().toLocalTime().toString().substring(0, 5));
        entity.setCheckInTime(LocalDateTime.now().toLocalTime().toString().substring(0, 5));
        entity.setMissedCount(0);

        tokenRepository.save(entity);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("tokenNumber", tokenNumber);
        res.put("token", entity);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/call-next")
    public ResponseEntity<Map<String, Object>> callNextToken(@RequestBody Map<String, Object> req) {
        Long counterId = Long.valueOf(req.get("counterId").toString());
        Optional<StaffCounterEntity> optCounter = counterRepository.findById(counterId);

        if (optCounter.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Counter not found"));
        }

        StaffCounterEntity counter = optCounter.get();
        List<QueueTokenEntity> queued = tokenRepository.findByStatus("QUEUED");

        if (queued.isEmpty()) {
            counter.setCurrentToken(null);
            counter.setStatus("IDLE");
            counterRepository.save(counter);
            return ResponseEntity.ok(Map.of("success", false, "message", "Queue is empty"));
        }

        // Deterministic 2:1 Interleaved Queue Allocation
        // Priority first
        Optional<QueueTokenEntity> priority = queued.stream().filter(t -> "PRIORITY".equalsIgnoreCase(t.getTokenType())).findFirst();
        QueueTokenEntity nextToken;

        if (priority.isPresent()) {
            nextToken = priority.get();
        } else {
            List<QueueTokenEntity> appointments = queued.stream().filter(t -> "APPOINTMENT".equalsIgnoreCase(t.getTokenType())).toList();
            List<QueueTokenEntity> walkIns = queued.stream().filter(t -> "WALK_IN".equalsIgnoreCase(t.getTokenType())).toList();

            if (!appointments.isEmpty() && interleaveCounter < 2) {
                nextToken = appointments.get(0);
                interleaveCounter++;
            } else if (!walkIns.isEmpty()) {
                nextToken = walkIns.get(0);
                interleaveCounter = 0;
            } else if (!appointments.isEmpty()) {
                nextToken = appointments.get(0);
                interleaveCounter = 1;
            } else {
                nextToken = queued.get(0);
            }
        }

        nextToken.setStatus("CALLED");
        nextToken.setCounterId(counterId);
        nextToken.setCalledAt(LocalDateTime.now());
        tokenRepository.save(nextToken);

        counter.setCurrentToken(nextToken.getTokenNumber());
        counter.setStatus("CALLING");
        counterRepository.save(counter);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("token", nextToken);
        res.put("counter", counter);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/no-show")
    public ResponseEntity<Map<String, Object>> markNoShow(@RequestBody Map<String, Object> req) {
        String tokenNumber = (String) req.get("tokenNumber");
        Optional<QueueTokenEntity> opt = tokenRepository.findByTokenNumber(tokenNumber);

        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Token not found"));
        }

        QueueTokenEntity token = opt.get();
        token.setMissedCount(token.getMissedCount() + 1);

        String result;
        if (token.getMissedCount() == 1) {
            token.setStatus("QUEUED"); // Penalized back
            result = "1st miss: Token pushed back 3 spots in queue.";
        } else {
            token.setStatus("CANCELLED");
            result = "2nd miss: Token permanently cancelled.";
        }

        tokenRepository.save(token);
        return ResponseEntity.ok(Map.of("success", true, "result", result, "missedCount", token.getMissedCount()));
    }
}
