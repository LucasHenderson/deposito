package com.leogas.api.repository;

import com.leogas.api.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("SELECT DISTINCT p FROM Produto p LEFT JOIN FETCH p.vinculos v LEFT JOIN FETCH v.variavelEstoque")
    List<Produto> findAllWithVinculos();
}
