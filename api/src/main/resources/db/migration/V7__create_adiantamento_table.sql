CREATE TABLE adiantamento (
    id              BIGSERIAL      PRIMARY KEY,
    entregador_id   BIGINT         NOT NULL REFERENCES entregador(id),
    descricao       VARCHAR(200)   NOT NULL,
    data            DATE           NOT NULL,
    valor           DECIMAL(10,2)  NOT NULL
);
