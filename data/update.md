# Database Updates (zh.db)

## Overview
This document logs the recent architectural changes made to the `zh.db` database to accommodate the new and improved Chinese Character Decomposition and Etymology system.

## Table Changes

### 1. `decomposition_details` (Replaced)
The `decomposition_details` table has been completely replaced with **6,265** deeply analyzed branch characters. 
- **Schema Updates**: The table schema now perfectly aligns with the JSON structure, featuring separated etymology components and educational hints.
- **Key Columns Added/Maintained**:
  - `etymology_type`: Categorization of the character (e.g., Phono-semantic, Ideogrammic).
  - `etymology_semantic` / `etymology_phonetic`: The precise visual variants used as the meaning/sound components.
  - `etymology_hint` / `etymology_hint_vi`: High-quality, AI-generated associative learning hints (in English and Vietnamese) to aid in memorization.

### 2. `decomposition_radicals` (Replaced)
The `decomposition_radicals` table has been replaced with the newly consolidated **337** atomic leaf components.
- **Data Consolidation**: Merged previous single characters and pure radicals into one unified root dataset.
- **Schema Updates**:
  - Added `variants` and `simplified` columns to track all visual forms of a root radical.
  - Standardized the `type` column to distinguish between `radical` and `other`.

### 3. `decomposition_specials` (NEW)
A brand new table has been created to house the **182** virtual/special characters (PUA codes).
- **Purpose**: To act as the structural "glue" for characters that contain complex positional alignments not officially encoded in standard Unicode.
- **Columns**:
  - `character`: The Private Use Area (PUA) symbol (e.g., `\uE001`).
  - `hex_code`: The hexadecimal string for reference.
  - `decomposition`: The standard CHISE IDS sequence to unpack the special character.

## Data Flow
The entire database now perfectly mirrors the 3-file local JSON architecture (`decomposition.json`, `decomposition_radicals.json`, `specials.json`), ensuring seamless integration between the database and local development workflows.

## Migration 2026-10-10 — New simplified learning structure (`data/decompostion/`)

Old etymology schema (`etymology_type/semantic/phonetic`, `definition_en`, `parent_radical`, `meaning_en`, `strokecount`) was dropped. Tables were recreated to mirror the new JSON files exactly:

- `decomposition_details` (**6,225** rows): `id, character, pinyin, definition_vi, radical, decomposition, stroke_count, hint_vi` (+ sparse `hint`, `definition_en` kept nullable for the few rows that have them).
- `decomposition_radicals` (**318** rows): `id, character, radical_number (nullable), variants, simplified, pinyin, meaning_vi, type ('radical' | 'other')`.
- `decomposition_specials` (**203** rows): `id, character, hex_code, decomposition`.

Backend (`decomposition.rs`, `models`, `state.rs`) and frontend (`types.ts`, `src/types`, `DecompositionDetails.tsx`) were redesigned: the details panel now leads with the **Cách nhớ** (`hint_vi`) story card plus radical/stroke-count badges; the etymology classifier and English mnemonic sections were removed. Variant resolution via `variants`/`simplified` columns is unchanged.
