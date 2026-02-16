package com.leogas.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class EntregadorResponse {
    private Long id;
    private String nomeCompleto;
    private String telefone;
    private String identificador;
    private BigDecimal salario;
    private Boolean ativo;
    private LocalDate dataCadastro;
}
