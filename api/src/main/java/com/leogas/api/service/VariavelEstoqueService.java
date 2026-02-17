package com.leogas.api.service;

import com.leogas.api.dto.VariavelEstoqueRequest;
import com.leogas.api.dto.VariavelEstoqueResponse;
import com.leogas.api.entity.VariavelEstoque;
import com.leogas.api.repository.VariavelEstoqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VariavelEstoqueService {

    private final VariavelEstoqueRepository repository;

    public List<VariavelEstoqueResponse> listarTodas() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public VariavelEstoqueResponse criar(VariavelEstoqueRequest request) {
        if (repository.existsByNomeIgnoreCase(request.getNome())) {
            throw new RuntimeException("Já existe uma variável com este nome");
        }

        VariavelEstoque entity = VariavelEstoque.builder()
                .nome(request.getNome())
                .quantidade(request.getQuantidade())
                .build();

        return toResponse(repository.save(entity));
    }

    @Transactional
    public VariavelEstoqueResponse atualizar(Long id, VariavelEstoqueRequest request) {
        VariavelEstoque entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Variável não encontrada"));

        if (repository.existsByNomeIgnoreCaseAndIdNot(request.getNome(), id)) {
            throw new RuntimeException("Já existe uma variável com este nome");
        }

        entity.setNome(request.getNome());
        entity.setQuantidade(request.getQuantidade());

        return toResponse(repository.save(entity));
    }

    @Transactional
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Variável não encontrada");
        }
        repository.deleteById(id);
    }

    @Transactional
    public VariavelEstoqueResponse atualizarQuantidade(Long id, Integer quantidade) {
        VariavelEstoque entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Variável não encontrada"));

        entity.setQuantidade(quantidade);
        return toResponse(repository.save(entity));
    }

    private VariavelEstoqueResponse toResponse(VariavelEstoque entity) {
        return VariavelEstoqueResponse.builder()
                .id(entity.getId())
                .nome(entity.getNome())
                .quantidade(entity.getQuantidade())
                .build();
    }
}
