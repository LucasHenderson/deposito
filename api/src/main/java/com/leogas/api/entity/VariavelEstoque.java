package com.leogas.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "variavel_estoque")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariavelEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nome;

    @Column(nullable = false)
    private Integer quantidade = 0;
}
