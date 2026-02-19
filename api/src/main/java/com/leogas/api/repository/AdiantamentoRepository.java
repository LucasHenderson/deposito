package com.leogas.api.repository;

import com.leogas.api.entity.Adiantamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdiantamentoRepository extends JpaRepository<Adiantamento, Long> {
    List<Adiantamento> findByEntregadorId(Long entregadorId);
}
