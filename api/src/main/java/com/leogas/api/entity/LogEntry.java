package com.leogas.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "log_entry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String acao;

    @Column(nullable = false, length = 50)
    private String modulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String resumo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String detalhes;

    @Column(name = "detalhes_antes", columnDefinition = "TEXT")
    private String detalhesAntes;

    @Column(nullable = false, length = 100)
    private String usuario;

    @Column(nullable = false)
    private LocalDateTime data;

    @PrePersist
    public void prePersist() {
        if (this.data == null) {
            this.data = LocalDateTime.now();
        }
    }
}
