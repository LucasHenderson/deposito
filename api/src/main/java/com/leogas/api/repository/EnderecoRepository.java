package com.leogas.api.repository;

import com.leogas.api.entity.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EnderecoRepository extends JpaRepository<Endereco, Long> {

    @Query("SELECT DISTINCT e FROM Endereco e LEFT JOIN FETCH e.clientes")
    List<Endereco> findAllWithClientes();
}
