package com.leogas.api.repository;

import com.leogas.api.entity.VariavelEstoque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VariavelEstoqueRepository extends JpaRepository<VariavelEstoque, Long> {

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);

    List<VariavelEstoque> findAllByDataExclusaoIsNull();
}
