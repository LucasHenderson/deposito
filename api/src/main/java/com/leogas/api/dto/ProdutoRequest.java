package com.leogas.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProdutoRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, message = "Nome deve ter pelo menos 3 caracteres")
    private String nome;

    @NotNull(message = "Preço no crédito é obrigatório")
    @Positive(message = "Preço no crédito deve ser positivo")
    private BigDecimal precoCredito;

    @NotNull(message = "Preço no débito é obrigatório")
    @Positive(message = "Preço no débito deve ser positivo")
    private BigDecimal precoDebito;

    @NotNull(message = "Preço em dinheiro é obrigatório")
    @Positive(message = "Preço em dinheiro deve ser positivo")
    private BigDecimal precoDinheiro;

    @NotNull(message = "Preço no PIX é obrigatório")
    @Positive(message = "Preço no PIX deve ser positivo")
    private BigDecimal precoPix;

    @NotNull(message = "Vínculos são obrigatórios")
    @Size(min = 1, message = "Produto deve ter pelo menos 1 vínculo de estoque")
    @Valid
    private List<VinculoEstoqueRequest> vinculos;
}
