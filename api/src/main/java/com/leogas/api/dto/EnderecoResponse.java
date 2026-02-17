package com.leogas.api.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class EnderecoResponse {
    private Long id;
    private String quadra;
    private String alameda;
    private String qi;
    private String lote;
    private String casa;
    private String complemento;
    private List<Long> clientesIds;
}
