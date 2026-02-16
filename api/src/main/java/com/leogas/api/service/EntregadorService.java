package com.leogas.api.service;

import com.leogas.api.dto.EntregadorRequest;
import com.leogas.api.dto.EntregadorResponse;
import com.leogas.api.entity.Entregador;
import com.leogas.api.repository.EntregadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EntregadorService {

    private final EntregadorRepository entregadorRepository;

    public List<EntregadorResponse> listarTodos() {
        return entregadorRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public EntregadorResponse criar(EntregadorRequest request) {
        if (entregadorRepository.existsByIdentificadorIgnoreCase(request.getIdentificador())) {
            throw new RuntimeException("Identificador já existe");
        }

        Entregador entregador = Entregador.builder()
                .nomeCompleto(request.getNomeCompleto())
                .telefone(request.getTelefone())
                .identificador(request.getIdentificador().toUpperCase())
                .salario(request.getSalario())
                .ativo(true)
                .dataCadastro(request.getDataCadastro())
                .build();

        return toResponse(entregadorRepository.save(entregador));
    }

    public EntregadorResponse atualizar(Long id, EntregadorRequest request) {
        Entregador entregador = entregadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entregador não encontrado"));

        if (entregadorRepository.existsByIdentificadorIgnoreCaseAndIdNot(request.getIdentificador(), id)) {
            throw new RuntimeException("Identificador já existe");
        }

        entregador.setNomeCompleto(request.getNomeCompleto());
        entregador.setTelefone(request.getTelefone());
        entregador.setIdentificador(request.getIdentificador().toUpperCase());
        entregador.setSalario(request.getSalario());
        entregador.setDataCadastro(request.getDataCadastro());

        return toResponse(entregadorRepository.save(entregador));
    }

    public EntregadorResponse toggleStatus(Long id) {
        Entregador entregador = entregadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entregador não encontrado"));

        entregador.setAtivo(!entregador.getAtivo());
        return toResponse(entregadorRepository.save(entregador));
    }

    public boolean identificadorExiste(String identificador, Long excludeId) {
        if (excludeId != null) {
            return entregadorRepository.existsByIdentificadorIgnoreCaseAndIdNot(identificador, excludeId);
        }
        return entregadorRepository.existsByIdentificadorIgnoreCase(identificador);
    }

    private EntregadorResponse toResponse(Entregador entity) {
        return new EntregadorResponse(
                entity.getId(),
                entity.getNomeCompleto(),
                entity.getTelefone(),
                entity.getIdentificador(),
                entity.getSalario(),
                entity.getAtivo(),
                entity.getDataCadastro()
        );
    }
}
