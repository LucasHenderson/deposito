package com.leogas.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class VendaRequest {

    @NotNull
    private Long clienteId;

    @NotNull
    private Long enderecoId;

    @NotNull
    private Long entregadorId;

    @NotEmpty
    @Valid
    private List<ItemVendaRequest> itens;

    @NotEmpty
    @Valid
    private List<PagamentoVendaRequest> pagamentos;

    private String observacoes;
}
