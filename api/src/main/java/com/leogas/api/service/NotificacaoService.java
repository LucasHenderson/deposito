package com.leogas.api.service;

import com.leogas.api.dto.NotificacaoRequest;
import com.leogas.api.dto.NotificacaoResponse;
import com.leogas.api.entity.Notificacao;
import com.leogas.api.entity.Venda;
import com.leogas.api.repository.NotificacaoRepository;
import com.leogas.api.repository.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final VendaRepository vendaRepository;

    public List<NotificacaoResponse> listarTodas() {
        return notificacaoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public NotificacaoResponse criar(NotificacaoRequest request) {
        Venda venda = vendaRepository.findById(request.getVendaId())
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

        Notificacao notificacao = Notificacao.builder()
                .venda(venda)
                .clienteNome(request.getClienteNome())
                .valorTotal(request.getValorTotal())
                .mensagem(request.getMensagem())
                .dataAgendada(request.getDataAgendada())
                .build();

        return toResponse(notificacaoRepository.save(notificacao));
    }

    public void marcarComoLida(Long id) {
        Notificacao notificacao = notificacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada"));
        notificacao.setLida(true);
        notificacaoRepository.save(notificacao);
    }

    @Transactional
    public void marcarTodasComoLidas() {
        notificacaoRepository.marcarTodasComoLidas();
    }

    public void remover(Long id) {
        if (!notificacaoRepository.existsById(id)) {
            throw new RuntimeException("Notificação não encontrada");
        }
        notificacaoRepository.deleteById(id);
    }

    private NotificacaoResponse toResponse(Notificacao entity) {
        return new NotificacaoResponse(
                entity.getId(),
                entity.getVenda().getId(),
                entity.getClienteNome(),
                entity.getValorTotal(),
                entity.getMensagem(),
                entity.getDataAgendada(),
                entity.getLida(),
                entity.getCriadaEm()
        );
    }
}
