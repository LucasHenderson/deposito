package com.leogas.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VariavelEstoqueResponse {

    private Long id;
    private String nome;
    private Integer quantidade;
    private LocalDateTime dataExclusao;
}
