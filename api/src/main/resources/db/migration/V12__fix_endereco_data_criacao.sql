-- Endereços existentes antes do soft delete devem ter data_criacao antiga
-- para aparecerem corretamente no histórico do gráfico
UPDATE endereco SET data_criacao = '2020-01-01 00:00:00' WHERE data_exclusao IS NULL;
