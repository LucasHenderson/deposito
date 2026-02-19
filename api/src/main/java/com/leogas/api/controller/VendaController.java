package com.leogas.api.controller;

import com.leogas.api.dto.VendaRequest;
import com.leogas.api.dto.VendaResponse;
import com.leogas.api.service.VendaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/vendas")
@RequiredArgsConstructor
public class VendaController {

    private final VendaService vendaService;

    @GetMapping
    public ResponseEntity<List<VendaResponse>> listarTodas() {
        return ResponseEntity.ok(vendaService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<VendaResponse> criar(@Valid @RequestBody VendaRequest request) {
        try {
            VendaResponse response = vendaService.criar(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            log.error("Erro ao criar venda: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendaResponse> atualizar(@PathVariable Long id,
                                                    @Valid @RequestBody VendaRequest request) {
        try {
            VendaResponse response = vendaService.atualizar(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Erro ao atualizar venda {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            vendaService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Erro ao deletar venda {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<VendaResponse> atualizarStatus(@PathVariable Long id,
                                                          @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            VendaResponse response = vendaService.atualizarStatus(id, status);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Erro ao atualizar status da venda {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/recebimento-pendente")
    public ResponseEntity<VendaResponse> toggleRecebimentoPendente(@PathVariable Long id) {
        try {
            VendaResponse response = vendaService.toggleRecebimentoPendente(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Erro ao toggle recebimento pendente da venda {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
}
