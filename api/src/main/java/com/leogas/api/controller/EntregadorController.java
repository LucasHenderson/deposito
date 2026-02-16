package com.leogas.api.controller;

import com.leogas.api.dto.EntregadorRequest;
import com.leogas.api.dto.EntregadorResponse;
import com.leogas.api.service.EntregadorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/entregadores")
@RequiredArgsConstructor
public class EntregadorController {

    private final EntregadorService entregadorService;

    @GetMapping
    public ResponseEntity<List<EntregadorResponse>> listarTodos() {
        return ResponseEntity.ok(entregadorService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<EntregadorResponse> criar(@Valid @RequestBody EntregadorRequest request) {
        try {
            EntregadorResponse response = entregadorService.criar(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntregadorResponse> atualizar(@PathVariable Long id,
                                                         @Valid @RequestBody EntregadorRequest request) {
        try {
            EntregadorResponse response = entregadorService.atualizar(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).build();
        }
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<EntregadorResponse> toggleStatus(@PathVariable Long id) {
        try {
            EntregadorResponse response = entregadorService.toggleStatus(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/identificador-existe")
    public ResponseEntity<Map<String, Boolean>> identificadorExiste(
            @RequestParam String identificador,
            @RequestParam(required = false) Long excludeId) {
        boolean existe = entregadorService.identificadorExiste(identificador, excludeId);
        return ResponseEntity.ok(Map.of("existe", existe));
    }
}
