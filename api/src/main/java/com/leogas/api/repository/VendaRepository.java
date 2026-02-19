package com.leogas.api.repository;

import com.leogas.api.entity.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    @Query("SELECT DISTINCT v FROM Venda v LEFT JOIN FETCH v.itens ORDER BY v.dataVenda DESC")
    List<Venda> findAllWithItens();

    @Query("SELECT DISTINCT v FROM Venda v LEFT JOIN FETCH v.pagamentos ORDER BY v.dataVenda DESC")
    List<Venda> findAllWithPagamentos();

    @Query("SELECT v FROM Venda v LEFT JOIN FETCH v.itens WHERE v.id = :id")
    Optional<Venda> findByIdWithItens(Long id);

    @Query("SELECT v FROM Venda v LEFT JOIN FETCH v.pagamentos WHERE v.id = :id")
    Optional<Venda> findByIdWithPagamentos(Long id);
}
