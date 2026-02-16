CREATE TABLE log_entry (
    id              BIGSERIAL    PRIMARY KEY,
    acao            VARCHAR(20)  NOT NULL,
    modulo          VARCHAR(50)  NOT NULL,
    resumo          TEXT         NOT NULL,
    detalhes        TEXT         NOT NULL,
    detalhes_antes  TEXT,
    usuario         VARCHAR(100) NOT NULL,
    data            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_log_entry_data ON log_entry (data DESC);
