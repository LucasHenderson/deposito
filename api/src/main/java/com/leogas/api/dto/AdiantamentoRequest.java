package com.leogas.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AdiantamentoRequest {

    @NotNull
    private Long entregadorId;

    @NotBlank
    @Size(min = 3, max = 200)
    private String descricao;

    @NotNull
    private LocalDate data;

    @NotNull
    @Positive
    private BigDecimal valor;
}
