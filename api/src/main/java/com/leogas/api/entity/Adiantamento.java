package com.leogas.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "adiantamento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Adiantamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entregador_id", nullable = false)
    private Entregador entregador;

    @Column(nullable = false, length = 200)
    private String descricao;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;
}
