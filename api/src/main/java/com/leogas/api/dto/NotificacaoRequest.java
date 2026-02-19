package com.leogas.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class NotificacaoRequest {

    @NotNull
    private Long vendaId;

    @NotBlank
    @Size(max = 200)
    private String clienteNome;

    @NotNull
    @Positive
    private BigDecimal valorTotal;

    @NotBlank
    @Size(max = 500)
    private String mensagem;

    @NotNull
    private LocalDateTime dataAgendada;
}
