package com.leogas.api.controller;

import com.leogas.api.dto.LogEntryRequest;
import com.leogas.api.dto.LogEntryResponse;
import com.leogas.api.service.LogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    @GetMapping
    public ResponseEntity<List<LogEntryResponse>> listarTodos() {
        return ResponseEntity.ok(logService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<LogEntryResponse> registrar(@Valid @RequestBody LogEntryRequest request) {
        LogEntryResponse response = logService.registrar(request);
        return ResponseEntity.status(201).body(response);
    }
}
