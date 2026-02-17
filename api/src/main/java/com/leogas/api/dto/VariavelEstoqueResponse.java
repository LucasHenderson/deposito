package com.leogas.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VariavelEstoqueResponse {

    private Long id;
    private String nome;
    private Integer quantidade;
}
