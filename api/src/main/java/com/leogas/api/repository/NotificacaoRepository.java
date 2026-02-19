package com.leogas.api.repository;

import com.leogas.api.entity.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    @Modifying
    @Query("UPDATE Notificacao n SET n.lida = true WHERE n.lida = false")
    void marcarTodasComoLidas();
}
