package com.leogas.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class EnderecoRequest {

    @NotBlank(message = "Quadra é obrigatória")
    private String quadra;

    @NotBlank(message = "Alameda é obrigatória")
    private String alameda;

    private String qi = "";

    @NotBlank(message = "Lote é obrigatório")
    private String lote;

    private String casa = "";

    private String complemento = "";

    private List<Long> clientesIds = new ArrayList<>();
}
