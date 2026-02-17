package com.leogas.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VinculoEstoqueResponse {

    private Long variavelEstoqueId;
    private String tipoInteracao;
}
