-- Tabela de produtos
CREATE TABLE produto (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    preco_credito DECIMAL(10,2) NOT NULL,
    preco_debito DECIMAL(10,2) NOT NULL,
    preco_dinheiro DECIMAL(10,2) NOT NULL,
    preco_pix DECIMAL(10,2) NOT NULL
);

-- Tabela de vínculos produto <-> variável de estoque
CREATE TABLE produto_vinculo_estoque (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
    variavel_estoque_id BIGINT NOT NULL REFERENCES variavel_estoque(id),
    tipo_interacao VARCHAR(20) NOT NULL CHECK (tipo_interacao IN ('reduz', 'nao-altera', 'aumenta'))
);

CREATE INDEX idx_produto_vinculo_produto ON produto_vinculo_estoque (produto_id);
CREATE INDEX idx_produto_vinculo_variavel ON produto_vinculo_estoque (variavel_estoque_id);

-- Dados iniciais
INSERT INTO produto (id, nome, preco_credito, preco_debito, preco_dinheiro, preco_pix) VALUES
    (1, 'Gás de Cozinha P13 - Troca', 145.00, 140.00, 140.00, 140.00),
    (2, 'Gás de Cozinha P13 - Completo', 350.00, 350.00, 350.00, 350.00),
    (3, 'Água Mineral 20L - Troca', 17.00, 17.00, 17.00, 17.00),
    (4, 'Água Mineral 20L - Completo', 47.00, 47.00, 47.00, 47.00),
    (5, 'Registro Regulador - Com Mangueira', 100.00, 100.00, 90.00, 90.00),
    (6, 'Gás P13 + Brinde (Isqueiro)', 150.00, 145.00, 145.00, 145.00);

-- Vínculos de estoque
INSERT INTO produto_vinculo_estoque (produto_id, variavel_estoque_id, tipo_interacao) VALUES
    (1, 1, 'nao-altera'),   -- Gás Troca -> Gás P13 (não altera)
    (2, 1, 'reduz'),         -- Gás Completo -> Gás P13 (reduz)
    (3, 2, 'nao-altera'),   -- Água Troca -> Água 20L (não altera)
    (4, 2, 'reduz'),         -- Água Completo -> Água 20L (reduz)
    (5, 3, 'reduz'),         -- Registro -> Registro/Mangueira (reduz)
    (6, 1, 'nao-altera'),   -- Gás + Brinde -> Gás P13 (não altera)
    (6, 4, 'reduz');          -- Gás + Brinde -> Brindes (reduz)

-- Atualiza a sequência do produto para evitar conflitos
SELECT setval('produto_id_seq', (SELECT MAX(id) FROM produto));
