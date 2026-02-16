package com.leogas.api.repository;

import com.leogas.api.entity.Entregador;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntregadorRepository extends JpaRepository<Entregador, Long> {
    boolean existsByIdentificadorIgnoreCase(String identificador);
    boolean existsByIdentificadorIgnoreCaseAndIdNot(String identificador, Long id);
}
