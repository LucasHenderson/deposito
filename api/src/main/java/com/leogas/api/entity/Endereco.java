package com.leogas.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "endereco")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String quadra;

    @Column(nullable = false, length = 50)
    private String alameda;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String qi = "";

    @Column(nullable = false, length = 20)
    private String lote;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String casa = "";

    @Column(nullable = false, length = 200)
    @Builder.Default
    private String complemento = "";

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;

    @ManyToMany(mappedBy = "enderecos")
    @Builder.Default
    private Set<Cliente> clientes = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
    }
}
