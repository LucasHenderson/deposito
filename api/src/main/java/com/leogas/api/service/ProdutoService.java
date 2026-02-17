package com.leogas.api.service;

import com.leogas.api.dto.*;
import com.leogas.api.entity.Produto;
import com.leogas.api.entity.ProdutoVinculoEstoque;
import com.leogas.api.entity.VariavelEstoque;
import com.leogas.api.repository.ProdutoRepository;
import com.leogas.api.repository.VariavelEstoqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final VariavelEstoqueRepository variavelEstoqueRepository;

    public List<ProdutoResponse> listarTodos() {
        return produtoRepository.findAllWithVinculos().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest request) {
        Produto produto = Produto.builder()
                .nome(request.getNome())
                .precoCredito(request.getPrecoCredito())
                .precoDebito(request.getPrecoDebito())
                .precoDinheiro(request.getPrecoDinheiro())
                .precoPix(request.getPrecoPix())
                .build();

        addVinculos(produto, request.getVinculos());

        return toResponse(produtoRepository.save(produto));
    }

    @Transactional
    public ProdutoResponse atualizar(Long id, ProdutoRequest request) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        produto.setNome(request.getNome());
        produto.setPrecoCredito(request.getPrecoCredito());
        produto.setPrecoDebito(request.getPrecoDebito());
        produto.setPrecoDinheiro(request.getPrecoDinheiro());
        produto.setPrecoPix(request.getPrecoPix());

        produto.getVinculos().clear();
        addVinculos(produto, request.getVinculos());

        return toResponse(produtoRepository.save(produto));
    }

    @Transactional
    public void deletar(Long id) {
        if (!produtoRepository.existsById(id)) {
            throw new RuntimeException("Produto não encontrado");
        }
        produtoRepository.deleteById(id);
    }

    private void addVinculos(Produto produto, List<VinculoEstoqueRequest> vinculos) {
        for (VinculoEstoqueRequest vinculoReq : vinculos) {
            VariavelEstoque variavel = variavelEstoqueRepository.findById(vinculoReq.getVariavelEstoqueId())
                    .orElseThrow(() -> new RuntimeException("Variável de estoque não encontrada: " + vinculoReq.getVariavelEstoqueId()));

            ProdutoVinculoEstoque vinculo = ProdutoVinculoEstoque.builder()
                    .produto(produto)
                    .variavelEstoque(variavel)
                    .tipoInteracao(vinculoReq.getTipoInteracao())
                    .build();

            produto.getVinculos().add(vinculo);
        }
    }

    private ProdutoResponse toResponse(Produto produto) {
        List<VinculoEstoqueResponse> vinculos = produto.getVinculos().stream()
                .map(v -> VinculoEstoqueResponse.builder()
                        .variavelEstoqueId(v.getVariavelEstoque().getId())
                        .tipoInteracao(v.getTipoInteracao())
                        .build())
                .toList();

        return ProdutoResponse.builder()
                .id(produto.getId())
                .nome(produto.getNome())
                .precoCredito(produto.getPrecoCredito())
                .precoDebito(produto.getPrecoDebito())
                .precoDinheiro(produto.getPrecoDinheiro())
                .precoPix(produto.getPrecoPix())
                .vinculos(vinculos)
                .build();
    }
}
