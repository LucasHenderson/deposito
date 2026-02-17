package com.leogas.api.service;

import com.leogas.api.dto.EnderecoRequest;
import com.leogas.api.dto.EnderecoResponse;
import com.leogas.api.entity.Cliente;
import com.leogas.api.entity.Endereco;
import com.leogas.api.repository.ClienteRepository;
import com.leogas.api.repository.EnderecoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final ClienteRepository clienteRepository;

    public List<EnderecoResponse> listarTodos() {
        return enderecoRepository.findAllWithClientes().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public EnderecoResponse criar(EnderecoRequest request) {
        Endereco endereco = Endereco.builder()
                .quadra(request.getQuadra())
                .alameda(request.getAlameda())
                .qi(request.getQi() != null ? request.getQi() : "")
                .lote(request.getLote())
                .casa(request.getCasa() != null ? request.getCasa() : "")
                .complemento(request.getComplemento() != null ? request.getComplemento() : "")
                .build();

        endereco = enderecoRepository.save(endereco);

        // Associa clientes ao endereço
        if (request.getClientesIds() != null && !request.getClientesIds().isEmpty()) {
            List<Cliente> clientes = clienteRepository.findAllById(request.getClientesIds());
            for (Cliente cliente : clientes) {
                cliente.getEnderecos().add(endereco);
                clienteRepository.save(cliente);
            }
            endereco.setClientes(new HashSet<>(clientes));
        }

        return toResponse(endereco);
    }

    @Transactional
    public EnderecoResponse atualizar(Long id, EnderecoRequest request) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        endereco.setQuadra(request.getQuadra());
        endereco.setAlameda(request.getAlameda());
        endereco.setQi(request.getQi() != null ? request.getQi() : "");
        endereco.setLote(request.getLote());
        endereco.setCasa(request.getCasa() != null ? request.getCasa() : "");
        endereco.setComplemento(request.getComplemento() != null ? request.getComplemento() : "");

        // Remove endereço de todos os clientes atuais
        for (Cliente clienteAtual : new HashSet<>(endereco.getClientes())) {
            clienteAtual.getEnderecos().remove(endereco);
            clienteRepository.save(clienteAtual);
        }

        // Associa novos clientes
        if (request.getClientesIds() != null && !request.getClientesIds().isEmpty()) {
            List<Cliente> novosClientes = clienteRepository.findAllById(request.getClientesIds());
            for (Cliente cliente : novosClientes) {
                cliente.getEnderecos().add(endereco);
                clienteRepository.save(cliente);
            }
            endereco.setClientes(new HashSet<>(novosClientes));
        } else {
            endereco.setClientes(new HashSet<>());
        }

        enderecoRepository.save(endereco);
        return toResponse(endereco);
    }

    @Transactional
    public void deletar(Long id) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        // Remove endereço de todos os clientes antes de deletar
        for (Cliente cliente : new HashSet<>(endereco.getClientes())) {
            cliente.getEnderecos().remove(endereco);
            clienteRepository.save(cliente);
        }

        enderecoRepository.deleteById(id);
    }

    private EnderecoResponse toResponse(Endereco endereco) {
        List<Long> clientesIds = endereco.getClientes().stream()
                .map(Cliente::getId)
                .sorted()
                .toList();

        return EnderecoResponse.builder()
                .id(endereco.getId())
                .quadra(endereco.getQuadra())
                .alameda(endereco.getAlameda())
                .qi(endereco.getQi())
                .lote(endereco.getLote())
                .casa(endereco.getCasa())
                .complemento(endereco.getComplemento())
                .clientesIds(clientesIds)
                .build();
    }
}
