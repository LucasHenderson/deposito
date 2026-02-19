package com.leogas.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venda_id", nullable = false)
    private Venda venda;

    @Column(name = "cliente_nome", nullable = false, length = 200)
    private String clienteNome;

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(nullable = false, length = 500)
    private String mensagem;

    @Column(name = "data_agendada", nullable = false)
    private LocalDateTime dataAgendada;

    @Column(nullable = false)
    @Builder.Default
    private Boolean lida = false;

    @Column(name = "criada_em", nullable = false)
    @Builder.Default
    private LocalDateTime criadaEm = LocalDateTime.now();
}
