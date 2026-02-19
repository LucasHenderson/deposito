package com.leogas.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@Builder
public class PagamentoVendaResponse {
    private String forma;
    private BigDecimal valor;
}
