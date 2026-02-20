package com.leogas.api.repository;

import com.leogas.api.entity.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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

    @Query("SELECT CAST(v.dataVenda AS date), COUNT(v) FROM Venda v WHERE v.enderecoFormatado LIKE CONCAT('Qd. ', :quadra, '%') AND v.dataVenda >= :inicio AND v.dataVenda <= :fim GROUP BY CAST(v.dataVenda AS date) ORDER BY CAST(v.dataVenda AS date)")
    List<Object[]> countByQuadraGroupByDia(@Param("quadra") String quadra, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
