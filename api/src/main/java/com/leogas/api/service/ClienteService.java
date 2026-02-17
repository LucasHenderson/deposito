package com.leogas.api.service;

import com.leogas.api.dto.ClienteRequest;
import com.leogas.api.dto.ClienteResponse;
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
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final EnderecoRepository enderecoRepository;

    public List<ClienteResponse> listarTodos() {
        return clienteRepository.findAllWithEnderecos().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest request) {
        Cliente cliente = Cliente.builder()
                .nome(request.getNome())
                .telefone(request.getTelefone())
                .dataCadastro(request.getDataCadastro())
                .observacoes(request.getObservacoes() != null ? request.getObservacoes() : "")
                .build();

        // Associa endereços
        if (request.getEnderecosIds() != null && !request.getEnderecosIds().isEmpty()) {
            List<Endereco> enderecos = enderecoRepository.findAllById(request.getEnderecosIds());
            cliente.setEnderecos(new HashSet<>(enderecos));
        }

        cliente = clienteRepository.save(cliente);
        return toResponse(cliente);
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest request) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        cliente.setNome(request.getNome());
        cliente.setTelefone(request.getTelefone());
        cliente.setDataCadastro(request.getDataCadastro());
        cliente.setObservacoes(request.getObservacoes() != null ? request.getObservacoes() : "");

        // Atualiza endereços - limpa e re-associa
        cliente.getEnderecos().clear();
        if (request.getEnderecosIds() != null && !request.getEnderecosIds().isEmpty()) {
            List<Endereco> enderecos = enderecoRepository.findAllById(request.getEnderecosIds());
            cliente.setEnderecos(new HashSet<>(enderecos));
        }

        cliente = clienteRepository.save(cliente);
        return toResponse(cliente);
    }

    @Transactional
    public void deletar(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente não encontrado");
        }
        clienteRepository.deleteById(id);
    }

    private ClienteResponse toResponse(Cliente cliente) {
        List<Long> enderecosIds = cliente.getEnderecos().stream()
                .map(Endereco::getId)
                .sorted()
                .toList();

        return ClienteResponse.builder()
                .id(cliente.getId())
                .nome(cliente.getNome())
                .telefone(cliente.getTelefone())
                .dataCadastro(cliente.getDataCadastro())
                .observacoes(cliente.getObservacoes())
                .enderecosIds(enderecosIds)
                .build();
    }
}
