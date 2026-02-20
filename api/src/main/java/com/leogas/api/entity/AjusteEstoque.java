package com.leogas.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ajuste_estoque")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AjusteEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "variavel_estoque_id", nullable = false)
    private Long variavelEstoqueId;

    @Column(nullable = false)
    private Integer delta;

    @Column(name = "data_ajuste", nullable = false)
    private LocalDateTime dataAjuste;

    @PrePersist
    protected void onCreate() {
        if (dataAjuste == null) {
            dataAjuste = LocalDateTime.now();
        }
    }
}
