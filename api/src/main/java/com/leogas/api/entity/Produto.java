package com.leogas.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(name = "preco_credito", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoCredito;

    @Column(name = "preco_debito", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoDebito;

    @Column(name = "preco_dinheiro", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoDinheiro;

    @Column(name = "preco_pix", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoPix;

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProdutoVinculoEstoque> vinculos = new ArrayList<>();
}
