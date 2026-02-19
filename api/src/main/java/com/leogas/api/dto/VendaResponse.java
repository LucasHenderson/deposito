package com.leogas.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class VendaResponse {
    private Long id;
    private Long clienteId;
    private String clienteNome;
    private String clienteTelefone;
    private Long enderecoId;
    private String enderecoFormatado;
    private Long entregadorId;
    private String entregadorIdentificador;
    private List<ItemVendaResponse> itens;
    private List<PagamentoVendaResponse> pagamentos;
    private BigDecimal valorTotal;
    private String status;
    private Boolean recebimentoPendente;
    private LocalDateTime dataVenda;
    private String observacoes;
}
