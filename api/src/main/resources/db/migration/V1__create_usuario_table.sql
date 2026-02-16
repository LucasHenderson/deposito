CREATE TABLE usuario (
    id         BIGSERIAL    PRIMARY KEY,
    usuario    VARCHAR(100) NOT NULL UNIQUE,
    senha      VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL,
    ativo      BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuario (usuario, senha, role) VALUES
    ('leogas@adm',       '$2a$10$6Qf5I406Hb7ZbB.ixdl6m.mtGxTKCxhopSh5Xa4qW/pwU6d6PkzYG', 'ADMIN'),
    ('atendente@leogas', '$2a$10$mMZDrgmHhZQSbiJu7ojE.O/gCi2mcjmUHMt/c6KozMeHvnhGSy9aq', 'ATENDENTE');
