CREATE TABLE entregador (
    id              BIGSERIAL      PRIMARY KEY,
    nome_completo   VARCHAR(200)   NOT NULL,
    telefone        VARCHAR(20)    NOT NULL,
    identificador   VARCHAR(3)     NOT NULL UNIQUE,
    salario         DECIMAL(10,2)  NOT NULL,
    ativo           BOOLEAN        NOT NULL DEFAULT TRUE,
    data_cadastro   DATE           NOT NULL
);
