package com.leogas.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PagamentoVendaRequest {

    @NotBlank
    private String forma;

    @NotNull
    @Positive
    private BigDecimal valor;
}
