package com.leogas.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EntregadorRequest {

    @NotBlank
    @Size(min = 3, max = 200)
    private String nomeCompleto;

    @NotBlank
    private String telefone;

    @NotBlank
    @Size(min = 1, max = 3)
    private String identificador;

    @NotNull
    @Positive
    private BigDecimal salario;

    @NotNull
    private LocalDate dataCadastro;
}
