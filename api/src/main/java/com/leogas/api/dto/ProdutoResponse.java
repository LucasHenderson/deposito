package com.leogas.api.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProdutoResponse {

    private Long id;
    private String nome;
    private BigDecimal precoCredito;
    private BigDecimal precoDebito;
    private BigDecimal precoDinheiro;
    private BigDecimal precoPix;
    private List<VinculoEstoqueResponse> vinculos;
}
