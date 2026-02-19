package com.leogas.api.service;

import com.leogas.api.dto.AdiantamentoRequest;
import com.leogas.api.dto.AdiantamentoResponse;
import com.leogas.api.entity.Adiantamento;
import com.leogas.api.entity.Entregador;
import com.leogas.api.repository.AdiantamentoRepository;
import com.leogas.api.repository.EntregadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdiantamentoService {

    private final AdiantamentoRepository adiantamentoRepository;
    private final EntregadorRepository entregadorRepository;

    public List<AdiantamentoResponse> listarTodos() {
        return adiantamentoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public AdiantamentoResponse criar(AdiantamentoRequest request) {
        Entregador entregador = entregadorRepository.findById(request.getEntregadorId())
                .orElseThrow(() -> new RuntimeException("Entregador não encontrado"));

        Adiantamento adiantamento = Adiantamento.builder()
                .entregador(entregador)
                .descricao(request.getDescricao())
                .data(request.getData())
                .valor(request.getValor())
                .build();

        return toResponse(adiantamentoRepository.save(adiantamento));
    }

    public AdiantamentoResponse atualizar(Long id, AdiantamentoRequest request) {
        Adiantamento adiantamento = adiantamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adiantamento não encontrado"));

        adiantamento.setDescricao(request.getDescricao());
        adiantamento.setData(request.getData());
        adiantamento.setValor(request.getValor());

        return toResponse(adiantamentoRepository.save(adiantamento));
    }

    public void deletar(Long id) {
        if (!adiantamentoRepository.existsById(id)) {
            throw new RuntimeException("Adiantamento não encontrado");
        }
        adiantamentoRepository.deleteById(id);
    }

    private AdiantamentoResponse toResponse(Adiantamento entity) {
        return new AdiantamentoResponse(
                entity.getId(),
                entity.getEntregador().getId(),
                entity.getDescricao(),
                entity.getData(),
                entity.getValor()
        );
    }
}
