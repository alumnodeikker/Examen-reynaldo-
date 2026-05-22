CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE usuarios (
  id    serial PRIMARY KEY,
   nombre text,
  email text NOT NULL UNIQUE,

   creado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION aviso_nuevo_regitro()
RETURNS trigger AS $$
BEGIN
INSERT INTO notificaciones (mensaje)
VALUES ('se modificó por ultima vez el curso');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

