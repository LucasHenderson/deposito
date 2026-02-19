package com.leogas.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItemVendaRequest {

    @NotNull
    private Long produtoId;

    @NotNull
    @Positive
    private Integer quantidade;

    @NotNull
    @Positive
    private BigDecimal precoUnitario;

    @NotNull
    @Positive
    private BigDecimal subtotal;
}
