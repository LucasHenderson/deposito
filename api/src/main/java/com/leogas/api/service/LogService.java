package com.leogas.api.service;

import com.leogas.api.dto.LogEntryRequest;
import com.leogas.api.dto.LogEntryResponse;
import com.leogas.api.entity.LogEntry;
import com.leogas.api.repository.LogEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LogService {

    private final LogEntryRepository logEntryRepository;

    public List<LogEntryResponse> listarTodos() {
        return logEntryRepository.findAllByOrderByDataDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public LogEntryResponse registrar(LogEntryRequest request) {
        LogEntry logEntry = LogEntry.builder()
                .acao(request.getAcao())
                .modulo(request.getModulo())
                .resumo(request.getResumo())
                .detalhes(request.getDetalhes())
                .detalhesAntes(request.getDetalhesAntes())
                .usuario(request.getUsuario())
                .build();

        LogEntry saved = logEntryRepository.save(logEntry);
        return toResponse(saved);
    }

    private LogEntryResponse toResponse(LogEntry entity) {
        return new LogEntryResponse(
                entity.getId(),
                entity.getAcao(),
                entity.getModulo(),
                entity.getResumo(),
                entity.getDetalhes(),
                entity.getDetalhesAntes(),
                entity.getUsuario(),
                entity.getData()
        );
    }
}
