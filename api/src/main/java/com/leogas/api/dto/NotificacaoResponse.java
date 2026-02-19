package com.leogas.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class NotificacaoResponse {
    private Long id;
    private Long vendaId;
    private String clienteNome;
    private BigDecimal valorTotal;
    private String mensagem;
    private LocalDateTime dataAgendada;
    private Boolean lida;
    private LocalDateTime criadaEm;
}
