package com.leogas.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class LogEntryResponse {
    private Long id;
    private String acao;
    private String modulo;
    private String resumo;
    private String detalhes;
    private String detalhesAntes;
    private String usuario;
    private LocalDateTime data;
}
