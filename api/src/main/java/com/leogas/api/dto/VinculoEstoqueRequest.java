package com.leogas.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VinculoEstoqueRequest {

    @NotNull(message = "ID da variável de estoque é obrigatório")
    private Long variavelEstoqueId;

    @NotBlank(message = "Tipo de interação é obrigatório")
    private String tipoInteracao;
}
