package com.leogas.api.repository;

import com.leogas.api.entity.AjusteEstoque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AjusteEstoqueRepository extends JpaRepository<AjusteEstoque, Long> {

    List<AjusteEstoque> findAllByOrderByDataAjusteAsc();
}
