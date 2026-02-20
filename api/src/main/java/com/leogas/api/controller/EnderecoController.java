package com.leogas.api.controller;

import com.leogas.api.dto.EnderecoRequest;
import com.leogas.api.dto.EnderecoResponse;
import com.leogas.api.service.EnderecoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enderecos")
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService enderecoService;

    @GetMapping
    public ResponseEntity<List<EnderecoResponse>> listarTodos() {
        return ResponseEntity.ok(enderecoService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<EnderecoResponse> criar(@Valid @RequestBody EnderecoRequest request) {
        EnderecoResponse response = enderecoService.criar(request);
        return ResponseEntity.status(201).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnderecoResponse> atualizar(@PathVariable Long id,
                                                       @Valid @RequestBody EnderecoRequest request) {
        try {
            EnderecoResponse response = enderecoService.atualizar(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            enderecoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/historico-por-quadra")
    public ResponseEntity<List<Map<String, Object>>> historicoPorQuadra(@RequestParam String quadra) {
        return ResponseEntity.ok(enderecoService.historicoQuadra(quadra));
    }

    @GetMapping("/todas-quadras")
    public ResponseEntity<List<String>> todasQuadras() {
        return ResponseEntity.ok(enderecoService.listarTodasQuadras());
    }
}
