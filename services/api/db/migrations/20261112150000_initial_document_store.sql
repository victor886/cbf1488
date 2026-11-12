CREATE TABLE IF NOT EXISTS app_documents (
  row_order bigserial NOT NULL,
  collection text NOT NULL,
  id text NOT NULL,
  data jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS app_documents_collection_order_idx
  ON app_documents (collection, row_order);
