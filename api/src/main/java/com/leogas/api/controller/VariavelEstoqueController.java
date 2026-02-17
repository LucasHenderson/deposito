package com.leogas.api.controller;

import com.leogas.api.dto.VariavelEstoqueRequest;
import com.leogas.api.dto.VariavelEstoqueResponse;
import com.leogas.api.service.VariavelEstoqueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/variaveis-estoque")
@RequiredArgsConstructor
public class VariavelEstoqueController {

    private final VariavelEstoqueService variavelEstoqueService;

    @GetMapping
    public ResponseEntity<List<VariavelEstoqueResponse>> listarTodas() {
        return ResponseEntity.ok(variavelEstoqueService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<VariavelEstoqueResponse> criar(@Valid @RequestBody VariavelEstoqueRequest request) {
        try {
            VariavelEstoqueResponse response = variavelEstoqueService.criar(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<VariavelEstoqueResponse> atualizar(@PathVariable Long id,
                                                              @Valid @RequestBody VariavelEstoqueRequest request) {
        try {
            VariavelEstoqueResponse response = variavelEstoqueService.atualizar(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            variavelEstoqueService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
