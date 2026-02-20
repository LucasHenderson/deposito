package com.leogas.api.repository;

import com.leogas.api.entity.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EnderecoRepository extends JpaRepository<Endereco, Long> {

    @Query("SELECT DISTINCT e FROM Endereco e LEFT JOIN FETCH e.clientes WHERE e.dataExclusao IS NULL")
    List<Endereco> findAllActiveWithClientes();

    @Query("SELECT e FROM Endereco e WHERE e.quadra = :quadra")
    List<Endereco> findAllByQuadraIncludingDeleted(@Param("quadra") String quadra);

    @Query("SELECT DISTINCT e.quadra FROM Endereco e ORDER BY e.quadra")
    List<String> findAllDistinctQuadras();
}
