package com.leogas.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ClienteResponse {
    private Long id;
    private String nome;
    private String telefone;
    private LocalDate dataCadastro;
    private String observacoes;
    private List<Long> enderecosIds;
}
