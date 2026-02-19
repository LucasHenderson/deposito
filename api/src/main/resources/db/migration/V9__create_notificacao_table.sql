CREATE TABLE notificacao (
    id              BIGSERIAL       PRIMARY KEY,
    venda_id        BIGINT          NOT NULL REFERENCES venda(id) ON DELETE CASCADE,
    cliente_nome    VARCHAR(200)    NOT NULL,
    valor_total     DECIMAL(10,2)   NOT NULL,
    mensagem        VARCHAR(500)    NOT NULL,
    data_agendada   TIMESTAMP       NOT NULL,
    lida            BOOLEAN         NOT NULL DEFAULT FALSE,
    criada_em       TIMESTAMP       NOT NULL DEFAULT NOW()
);
