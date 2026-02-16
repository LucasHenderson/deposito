package com.leogas.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LogEntryRequest {

    @NotBlank
    private String acao;

    @NotBlank
    private String modulo;

    @NotBlank
    private String resumo;

    @NotBlank
    private String detalhes;

    private String detalhesAntes;

    @NotBlank
    private String usuario;
}
