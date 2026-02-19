package com.leogas.api.controller;

import com.leogas.api.dto.AdiantamentoRequest;
import com.leogas.api.dto.AdiantamentoResponse;
import com.leogas.api.service.AdiantamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adiantamentos")
@RequiredArgsConstructor
public class AdiantamentoController {

    private final AdiantamentoService adiantamentoService;

    @GetMapping
    public ResponseEntity<List<AdiantamentoResponse>> listarTodos() {
        return ResponseEntity.ok(adiantamentoService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<AdiantamentoResponse> criar(@Valid @RequestBody AdiantamentoRequest request) {
        try {
            AdiantamentoResponse response = adiantamentoService.criar(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdiantamentoResponse> atualizar(@PathVariable Long id,
                                                           @Valid @RequestBody AdiantamentoRequest request) {
        try {
            AdiantamentoResponse response = adiantamentoService.atualizar(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            adiantamentoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
