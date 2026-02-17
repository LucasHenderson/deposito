-- Tabela de endereços
CREATE TABLE endereco (
    id BIGSERIAL PRIMARY KEY,
    quadra VARCHAR(50) NOT NULL,
    alameda VARCHAR(50) NOT NULL,
    qi VARCHAR(20) NOT NULL DEFAULT '',
    lote VARCHAR(20) NOT NULL,
    casa VARCHAR(20) NOT NULL DEFAULT '',
    complemento VARCHAR(200) NOT NULL DEFAULT ''
);

-- Tabela de clientes
CREATE TABLE cliente (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    data_cadastro DATE NOT NULL,
    observacoes TEXT NOT NULL DEFAULT ''
);

-- Tabela de junção N:N entre cliente e endereço
CREATE TABLE cliente_endereco (
    cliente_id BIGINT NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
    endereco_id BIGINT NOT NULL REFERENCES endereco(id) ON DELETE CASCADE,
    PRIMARY KEY (cliente_id, endereco_id)
);

CREATE INDEX idx_cliente_endereco_cliente ON cliente_endereco(cliente_id);
CREATE INDEX idx_cliente_endereco_endereco ON cliente_endereco(endereco_id);

-- Seed: 10 endereços
INSERT INTO endereco (id, quadra, alameda, qi, lote, casa, complemento) VALUES
    (1, '104 Norte', '01', '', '15', 'A', 'Próximo ao mercado'),
    (2, '104 Norte', '03', '', '22', '', ''),
    (3, '104 Norte', '05', '', '08', 'B', 'Casa azul'),
    (4, '110 Norte', '02', '', '30', '', 'Esquina'),
    (5, '110 Norte', '10', 'QI-05', '12', 'C', ''),
    (6, '203 Sul', '04', '', '18', '', 'Portão verde'),
    (7, '203 Sul', '08', '', '25', 'A', ''),
    (8, '305 Sul', '01', 'QI-02', '05', '', 'Ao lado da padaria'),
    (9, '305 Sul', '06', '', '14', 'B', ''),
    (10, '408 Norte', '12', '', '33', '', 'Casa de esquina amarela');

SELECT setval('endereco_id_seq', (SELECT MAX(id) FROM endereco));

-- Seed: 12 clientes
INSERT INTO cliente (id, nome, telefone, data_cadastro, observacoes) VALUES
    (1, 'Maria Silva', '(63) 99999-1111', '2024-01-15', 'Cliente preferencial, sempre paga no PIX'),
    (2, 'João Santos', '(63) 99999-2222', '2024-02-20', ''),
    (3, 'Ana Oliveira', '(63) 99999-3333', '2024-03-10', 'Ligar antes de entregar'),
    (4, 'Carlos Ferreira', '(63) 99999-4444', '2024-04-05', ''),
    (5, 'Fernanda Costa', '(63) 99999-5555', '2024-05-12', 'Prefere entregas pela manhã'),
    (6, 'Roberto Lima', '(63) 99999-6666', '2024-06-18', ''),
    (7, 'Patrícia Almeida', '(63) 99999-7777', '2024-07-22', 'Tem cachorro no quintal'),
    (8, 'Lucas Rodrigues', '(63) 99999-8888', '2024-08-30', ''),
    (9, 'Camila Martins', '(63) 99999-9999', '2024-09-15', 'Sempre compra 2 botijões'),
    (10, 'Pedro Henrique', '(63) 98888-0000', '2024-10-20', ''),
    (11, 'Juliana Souza', '(63) 98888-1111', '2024-11-25', 'Cliente nova'),
    (12, 'Ricardo Barbosa', '(63) 98888-2222', '2024-12-01', '');

SELECT setval('cliente_id_seq', (SELECT MAX(id) FROM cliente));

-- Seed: vínculos N:N
INSERT INTO cliente_endereco (cliente_id, endereco_id) VALUES
    (1, 1), (1, 8),
    (2, 1),
    (3, 2), (3, 10),
    (4, 3),
    (5, 4), (5, 10),
    (6, 4),
    (7, 5),
    (8, 6),
    (9, 6),
    (10, 7),
    (11, 8),
    (12, 9);
