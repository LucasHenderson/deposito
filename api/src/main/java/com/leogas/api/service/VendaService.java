package com.leogas.api.service;

import com.leogas.api.dto.*;
import com.leogas.api.entity.*;
import com.leogas.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ClienteRepository clienteRepository;
    private final EnderecoRepository enderecoRepository;
    private final EntregadorRepository entregadorRepository;
    private final ProdutoRepository produtoRepository;
    private final VariavelEstoqueRepository variavelEstoqueRepository;

    @Transactional(readOnly = true)
    public List<VendaResponse> listarTodas() {
        // Duas queries separadas para evitar MultipleBagFetchException (Hibernate 6)
        // A segunda query inicializa pagamentos nas mesmas entidades do persistence context
        List<Venda> vendas = vendaRepository.findAllWithItens();
        vendaRepository.findAllWithPagamentos();
        return vendas.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public VendaResponse criar(VendaRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        Endereco endereco = enderecoRepository.findById(request.getEnderecoId())
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));
        Entregador entregador = entregadorRepository.findById(request.getEntregadorId())
                .orElseThrow(() -> new RuntimeException("Entregador não encontrado"));

        // Calcula valor total a partir dos itens
        BigDecimal valorTotal = BigDecimal.ZERO;
        for (ItemVendaRequest item : request.getItens()) {
            valorTotal = valorTotal.add(item.getSubtotal());
        }

        Venda venda = Venda.builder()
                .cliente(cliente)
                .clienteNome(cliente.getNome())
                .clienteTelefone(cliente.getTelefone())
                .endereco(endereco)
                .enderecoFormatado(formatarEndereco(endereco))
                .entregador(entregador)
                .entregadorIdentificador(entregador.getIdentificador())
                .status("a-entregar")
                .recebimentoPendente(false)
                .dataVenda(LocalDateTime.now())
                .valorTotal(valorTotal)
                .observacoes(request.getObservacoes() != null ? request.getObservacoes() : "")
                .build();

        // Adiciona itens
        for (ItemVendaRequest itemReq : request.getItens()) {
            Produto produto = produtoRepository.findById(itemReq.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemReq.getProdutoId()));

            ItemVenda item = ItemVenda.builder()
                    .venda(venda)
                    .produto(produto)
                    .produtoNome(produto.getNome())
                    .quantidade(itemReq.getQuantidade())
                    .precoUnitario(itemReq.getPrecoUnitario())
                    .subtotal(itemReq.getSubtotal())
                    .build();
            venda.getItens().add(item);

            // Ajusta estoque
            ajustarEstoque(produto, itemReq.getQuantidade(), false);
        }

        // Adiciona pagamentos
        for (PagamentoVendaRequest pagReq : request.getPagamentos()) {
            PagamentoVenda pagamento = PagamentoVenda.builder()
                    .venda(venda)
                    .forma(pagReq.getForma())
                    .valor(pagReq.getValor())
                    .build();
            venda.getPagamentos().add(pagamento);
        }

        return toResponse(vendaRepository.save(venda));
    }

    @Transactional
    public VendaResponse atualizar(Long id, VendaRequest request) {
        Venda venda = vendaRepository.findByIdWithItens(id)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));
        vendaRepository.findByIdWithPagamentos(id);

        // Reverte estoque dos itens antigos
        for (ItemVenda itemAntigo : venda.getItens()) {
            Produto produto = itemAntigo.getProduto();
            ajustarEstoque(produto, itemAntigo.getQuantidade(), true);
        }

        // Atualiza referências
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        Endereco endereco = enderecoRepository.findById(request.getEnderecoId())
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));
        Entregador entregador = entregadorRepository.findById(request.getEntregadorId())
                .orElseThrow(() -> new RuntimeException("Entregador não encontrado"));

        venda.setCliente(cliente);
        venda.setClienteNome(cliente.getNome());
        venda.setClienteTelefone(cliente.getTelefone());
        venda.setEndereco(endereco);
        venda.setEnderecoFormatado(formatarEndereco(endereco));
        venda.setEntregador(entregador);
        venda.setEntregadorIdentificador(entregador.getIdentificador());
        venda.setObservacoes(request.getObservacoes() != null ? request.getObservacoes() : "");

        // Limpa itens e pagamentos antigos
        venda.getItens().clear();
        venda.getPagamentos().clear();
        vendaRepository.flush();

        // Adiciona novos itens
        BigDecimal valorTotal = BigDecimal.ZERO;
        for (ItemVendaRequest itemReq : request.getItens()) {
            Produto produto = produtoRepository.findById(itemReq.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemReq.getProdutoId()));

            ItemVenda item = ItemVenda.builder()
                    .venda(venda)
                    .produto(produto)
                    .produtoNome(produto.getNome())
                    .quantidade(itemReq.getQuantidade())
                    .precoUnitario(itemReq.getPrecoUnitario())
                    .subtotal(itemReq.getSubtotal())
                    .build();
            venda.getItens().add(item);
            valorTotal = valorTotal.add(itemReq.getSubtotal());

            // Aplica novo estoque
            ajustarEstoque(produto, itemReq.getQuantidade(), false);
        }

        venda.setValorTotal(valorTotal);

        // Adiciona novos pagamentos
        for (PagamentoVendaRequest pagReq : request.getPagamentos()) {
            PagamentoVenda pagamento = PagamentoVenda.builder()
                    .venda(venda)
                    .forma(pagReq.getForma())
                    .valor(pagReq.getValor())
                    .build();
            venda.getPagamentos().add(pagamento);
        }

        return toResponse(vendaRepository.save(venda));
    }

    @Transactional
    public void deletar(Long id) {
        Venda venda = vendaRepository.findByIdWithItens(id)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));
        vendaRepository.findByIdWithPagamentos(id);

        // Reverte estoque de todos os itens
        for (ItemVenda item : venda.getItens()) {
            ajustarEstoque(item.getProduto(), item.getQuantidade(), true);
        }

        vendaRepository.delete(venda);
    }

    @Transactional
    public VendaResponse atualizarStatus(Long id, String status) {
        Venda venda = vendaRepository.findByIdWithItens(id)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));
        vendaRepository.findByIdWithPagamentos(id);
        venda.setStatus(status);
        return toResponse(vendaRepository.save(venda));
    }

    @Transactional
    public VendaResponse toggleRecebimentoPendente(Long id) {
        Venda venda = vendaRepository.findByIdWithItens(id)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));
        vendaRepository.findByIdWithPagamentos(id);
        venda.setRecebimentoPendente(!venda.getRecebimentoPendente());
        return toResponse(vendaRepository.save(venda));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> contarVendasPorQuadra(String quadra, LocalDate inicio, LocalDate fim) {
        LocalDateTime dtInicio = inicio.atStartOfDay();
        LocalDateTime dtFim = fim.atTime(LocalTime.MAX);

        List<Object[]> resultados = vendaRepository.countByQuadraGroupByDia(quadra, dtInicio, dtFim);

        List<Map<String, Object>> lista = new ArrayList<>();
        for (Object[] row : resultados) {
            Map<String, Object> item = new LinkedHashMap<>();
            // O CAST retorna java.sql.Date
            Date sqlDate = (Date) row[0];
            item.put("data", sqlDate.toLocalDate().toString());
            item.put("total", ((Number) row[1]).longValue());
            lista.add(item);
        }
        return lista;
    }

    /**
     * Ajusta estoque baseado nos vínculos do produto.
     * @param reverter true para reverter (desfazer), false para aplicar normalmente
     */
    private void ajustarEstoque(Produto produto, int quantidade, boolean reverter) {
        // Precisamos carregar os vínculos com variáveis de estoque
        Produto produtoComVinculos = produtoRepository.findAllWithVinculos().stream()
                .filter(p -> p.getId().equals(produto.getId()))
                .findFirst()
                .orElse(produto);

        for (ProdutoVinculoEstoque vinculo : produtoComVinculos.getVinculos()) {
            VariavelEstoque variavel = vinculo.getVariavelEstoque();
            String tipo = vinculo.getTipoInteracao();

            if ("reduz".equals(tipo)) {
                if (reverter) {
                    variavel.setQuantidade(variavel.getQuantidade() + quantidade);
                } else {
                    variavel.setQuantidade(variavel.getQuantidade() - quantidade);
                }
                variavelEstoqueRepository.save(variavel);
            } else if ("aumenta".equals(tipo)) {
                if (reverter) {
                    variavel.setQuantidade(variavel.getQuantidade() - quantidade);
                } else {
                    variavel.setQuantidade(variavel.getQuantidade() + quantidade);
                }
                variavelEstoqueRepository.save(variavel);
            }
            // "nao-altera" não faz nada
        }
    }

    private String formatarEndereco(Endereco endereco) {
        StringBuilder sb = new StringBuilder();
        boolean first = true;

        if (endereco.getQuadra() != null && !endereco.getQuadra().isEmpty()) {
            sb.append("Qd. ").append(endereco.getQuadra());
            first = false;
        }
        if (endereco.getAlameda() != null && !endereco.getAlameda().isEmpty()) {
            if (!first) sb.append(", ");
            sb.append("Al. ").append(endereco.getAlameda());
            first = false;
        }
        if (endereco.getQi() != null && !endereco.getQi().isEmpty()) {
            if (!first) sb.append(", ");
            sb.append(endereco.getQi());
            first = false;
        }
        if (endereco.getLote() != null && !endereco.getLote().isEmpty()) {
            if (!first) sb.append(", ");
            sb.append("Lt. ").append(endereco.getLote());
            first = false;
        }
        if (endereco.getCasa() != null && !endereco.getCasa().isEmpty()) {
            if (!first) sb.append(", ");
            sb.append("Casa ").append(endereco.getCasa());
            first = false;
        }
        if (endereco.getComplemento() != null && !endereco.getComplemento().isEmpty()) {
            if (!first) sb.append(", ");
            sb.append("(").append(endereco.getComplemento()).append(")");
        }

        return sb.length() > 0 ? sb.toString() : "Endereço não informado";
    }

    private VendaResponse toResponse(Venda venda) {
        List<ItemVendaResponse> itens = venda.getItens().stream()
                .map(item -> ItemVendaResponse.builder()
                        .produtoId(item.getProduto().getId())
                        .produtoNome(item.getProdutoNome())
                        .quantidade(item.getQuantidade())
                        .precoUnitario(item.getPrecoUnitario())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        List<PagamentoVendaResponse> pagamentos = venda.getPagamentos().stream()
                .map(pag -> PagamentoVendaResponse.builder()
                        .forma(pag.getForma())
                        .valor(pag.getValor())
                        .build())
                .toList();

        return VendaResponse.builder()
                .id(venda.getId())
                .clienteId(venda.getCliente() != null ? venda.getCliente().getId() : null)
                .clienteNome(venda.getClienteNome())
                .clienteTelefone(venda.getClienteTelefone())
                .enderecoId(venda.getEndereco() != null ? venda.getEndereco().getId() : null)
                .enderecoFormatado(venda.getEnderecoFormatado())
                .entregadorId(venda.getEntregador() != null ? venda.getEntregador().getId() : null)
                .entregadorIdentificador(venda.getEntregadorIdentificador())
                .itens(itens)
                .pagamentos(pagamentos)
                .valorTotal(venda.getValorTotal())
                .status(venda.getStatus())
                .recebimentoPendente(venda.getRecebimentoPendente())
                .dataVenda(venda.getDataVenda())
                .observacoes(venda.getObservacoes())
                .build();
    }
}
