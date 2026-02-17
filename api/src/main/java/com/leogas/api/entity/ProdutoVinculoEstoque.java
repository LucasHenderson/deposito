package com.leogas.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "produto_vinculo_estoque")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProdutoVinculoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variavel_estoque_id", nullable = false)
    private VariavelEstoque variavelEstoque;

    @Column(name = "tipo_interacao", nullable = false, length = 20)
    private String tipoInteracao;
}
