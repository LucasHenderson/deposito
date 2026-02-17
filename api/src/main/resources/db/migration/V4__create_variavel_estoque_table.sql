-- Tabela de variáveis de estoque
CREATE TABLE variavel_estoque (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    quantidade INTEGER NOT NULL DEFAULT 0
);

-- Dados iniciais
INSERT INTO variavel_estoque (nome, quantidade) VALUES
    ('Gás P13', 70),
    ('Água 20L', 100),
    ('Registro/Mangueira', 15),
    ('Brindes', 50);
