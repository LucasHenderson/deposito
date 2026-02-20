CREATE TABLE ajuste_estoque (
    id BIGSERIAL PRIMARY KEY,
    variavel_estoque_id BIGINT NOT NULL,
    delta INTEGER NOT NULL,
    data_ajuste TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ajuste_variavel FOREIGN KEY (variavel_estoque_id) REFERENCES variavel_estoque(id)
);
