package com.leogas.api.service;

import com.leogas.api.dto.VariavelEstoqueRequest;
import com.leogas.api.dto.VariavelEstoqueResponse;
import com.leogas.api.entity.AjusteEstoque;
import com.leogas.api.entity.VariavelEstoque;
import com.leogas.api.repository.AjusteEstoqueRepository;
import com.leogas.api.repository.VariavelEstoqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VariavelEstoqueService {

    private final VariavelEstoqueRepository repository;
    private final AjusteEstoqueRepository ajusteRepository;

    public List<VariavelEstoqueResponse> listarTodas() {
        return repository.findAllByDataExclusaoIsNull().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<VariavelEstoqueResponse> listarTodasIncluindoDeletadas() {
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

        entity = repository.save(entity);

        // Registra ajuste inicial se quantidade > 0
        if (request.getQuantidade() != null && request.getQuantidade() != 0) {
            registrarAjuste(entity.getId(), request.getQuantidade());
        }

        return toResponse(entity);
    }

    @Transactional
    public VariavelEstoqueResponse atualizar(Long id, VariavelEstoqueRequest request) {
        VariavelEstoque entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Variável não encontrada"));

        if (repository.existsByNomeIgnoreCaseAndIdNot(request.getNome(), id)) {
            throw new RuntimeException("Já existe uma variável com este nome");
        }

        int delta = request.getQuantidade() - entity.getQuantidade();

        entity.setNome(request.getNome());
        entity.setQuantidade(request.getQuantidade());
        repository.save(entity);

        // Registra ajuste se houve mudança na quantidade
        if (delta != 0) {
            registrarAjuste(id, delta);
        }

        return toResponse(entity);
    }

    @Transactional
    public void deletar(Long id) {
        VariavelEstoque entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Variável não encontrada"));

        entity.setDataExclusao(LocalDateTime.now());
        repository.save(entity);
    }

    @Transactional
    public VariavelEstoqueResponse atualizarQuantidade(Long id, Integer quantidade) {
        VariavelEstoque entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Variável não encontrada"));

        int delta = quantidade - entity.getQuantidade();
        entity.setQuantidade(quantidade);
        repository.save(entity);

        if (delta != 0) {
            registrarAjuste(id, delta);
        }

        return toResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<AjusteEstoque> listarAjustes() {
        return ajusteRepository.findAllByOrderByDataAjusteAsc();
    }

    private void registrarAjuste(Long variavelEstoqueId, int delta) {
        AjusteEstoque ajuste = AjusteEstoque.builder()
                .variavelEstoqueId(variavelEstoqueId)
                .delta(delta)
                .build();
        ajusteRepository.save(ajuste);
    }

    private VariavelEstoqueResponse toResponse(VariavelEstoque entity) {
        return VariavelEstoqueResponse.builder()
                .id(entity.getId())
                .nome(entity.getNome())
                .quantidade(entity.getQuantidade())
                .dataExclusao(entity.getDataExclusao())
                .build();
    }
}
