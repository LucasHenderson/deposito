package com.leogas.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AdiantamentoResponse {
    private Long id;
    private Long entregadorId;
    private String descricao;
    private LocalDate data;
    private BigDecimal valor;
}
