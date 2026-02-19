CREATE TABLE venda (
    id                          BIGSERIAL       PRIMARY KEY,
    cliente_id                  BIGINT          NOT NULL REFERENCES cliente(id),
    cliente_nome                VARCHAR(200)    NOT NULL,
    cliente_telefone            VARCHAR(30)     NOT NULL,
    endereco_id                 BIGINT          NOT NULL REFERENCES endereco(id),
    endereco_formatado          VARCHAR(500)    NOT NULL,
    entregador_id               BIGINT          NOT NULL REFERENCES entregador(id),
    entregador_identificador    VARCHAR(10)     NOT NULL,
    status                      VARCHAR(20)     NOT NULL DEFAULT 'a-entregar',
    recebimento_pendente        BOOLEAN         NOT NULL DEFAULT FALSE,
    data_venda                  TIMESTAMP       NOT NULL DEFAULT NOW(),
    valor_total                 DECIMAL(10,2)   NOT NULL,
    observacoes                 TEXT            DEFAULT ''
);

CREATE TABLE item_venda (
    id              BIGSERIAL       PRIMARY KEY,
    venda_id        BIGINT          NOT NULL REFERENCES venda(id) ON DELETE CASCADE,
    produto_id      BIGINT          NOT NULL REFERENCES produto(id),
    produto_nome    VARCHAR(200)    NOT NULL,
    quantidade      INTEGER         NOT NULL,
    preco_unitario  DECIMAL(10,2)   NOT NULL,
    subtotal        DECIMAL(10,2)   NOT NULL
);

CREATE TABLE pagamento_venda (
    id          BIGSERIAL       PRIMARY KEY,
    venda_id    BIGINT          NOT NULL REFERENCES venda(id) ON DELETE CASCADE,
    forma       VARCHAR(20)     NOT NULL,
    valor       DECIMAL(10,2)   NOT NULL
);
