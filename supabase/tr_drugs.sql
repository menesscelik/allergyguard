-- Türkiye ilaç listesi (TİTCK SKRS e-reçete aktif ürünler)
-- 1) Bu SQL'i çalıştır  2) Table Editor → tr_drugs → Import data via CSV ile tr_drugs.csv'yi yükle

create table tr_drugs (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,        -- "PAROL 500 MG 20 TABLET"
  name_search       text not null,        -- normalize edilmiş arama metni (kucuk harf, aksansiz)
  barcode           text,                 -- EAN-13 (ileride barkod tarama icin)
  atc_code          text,                 -- "N02BE01"
  ingredient_en     text,                 -- "paracetamol" (ATC adı, İngilizce)
  prescription_type text                  -- "Normal" | "Kırmızı" ...
);

create index idx_tr_drugs_name_search on tr_drugs (name_search text_pattern_ops);
create index idx_tr_drugs_barcode on tr_drugs (barcode);

-- Hassas veri değil, referans listesi: herkes okuyabilir, kimse yazamaz
alter table tr_drugs enable row level security;
create policy "tr_drugs_read_all" on tr_drugs for select using (true);
