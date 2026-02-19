package com.leogas.api.controller;

import com.leogas.api.dto.NotificacaoRequest;
import com.leogas.api.dto.NotificacaoResponse;
import com.leogas.api.service.NotificacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/notificacoes")
@RequiredArgsConstructor
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    @GetMapping
    public ResponseEntity<List<NotificacaoResponse>> listarTodas() {
        return ResponseEntity.ok(notificacaoService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<NotificacaoResponse> criar(@Valid @RequestBody NotificacaoRequest request) {
        try {
            NotificacaoResponse response = notificacaoService.criar(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            log.error("Erro ao criar notificação: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(@PathVariable Long id) {
        try {
            notificacaoService.marcarComoLida(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/lidas")
    public ResponseEntity<Void> marcarTodasComoLidas() {
        notificacaoService.marcarTodasComoLidas();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        try {
            notificacaoService.remover(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
