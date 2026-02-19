-- Permite que vendas mantenham histórico mesmo após exclusão de cliente/endereço/entregador
-- Os dados denormalizados (cliente_nome, endereco_formatado, etc.) preservam as informações

-- cliente_id: torna nullable e altera FK para SET NULL
ALTER TABLE venda ALTER COLUMN cliente_id DROP NOT NULL;
ALTER TABLE venda DROP CONSTRAINT venda_cliente_id_fkey;
ALTER TABLE venda ADD CONSTRAINT venda_cliente_id_fkey
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE SET NULL;

-- endereco_id: torna nullable e altera FK para SET NULL
ALTER TABLE venda ALTER COLUMN endereco_id DROP NOT NULL;
ALTER TABLE venda DROP CONSTRAINT venda_endereco_id_fkey;
ALTER TABLE venda ADD CONSTRAINT venda_endereco_id_fkey
    FOREIGN KEY (endereco_id) REFERENCES endereco(id) ON DELETE SET NULL;

-- entregador_id: torna nullable e altera FK para SET NULL
ALTER TABLE venda ALTER COLUMN entregador_id DROP NOT NULL;
ALTER TABLE venda DROP CONSTRAINT venda_entregador_id_fkey;
ALTER TABLE venda ADD CONSTRAINT venda_entregador_id_fkey
    FOREIGN KEY (entregador_id) REFERENCES entregador(id) ON DELETE SET NULL;
