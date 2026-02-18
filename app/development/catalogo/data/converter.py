import pandas as pd
import json

def convert(xlsx_file, json_file):
    df = pd.read_excel(xlsx_file)
    df.to_json(json_file, orient="records", force_ascii=False, indent=2)

convert("catalogo_codigos.xlsx", "codigos_categoria.json")
convert("catalogo_codigos_defeitos.xlsx", "defeitos.json")
convert("catalogo_responsabilidades.xlsx", "responsabilidades.json")
convert("catalogo_modelos.xlsx", "modelos.json")
convert("catalogo_fmea.xlsx", "fmea.json")
convert("catalogo_agrupamento.xlsx", "agrupamento.json")
convert("catalogo_causas.xlsx", "causas.json")
convert("catalogo_nao_mostrar_indice.xlsx", "nao_mostrar_indice.json")
print("Conversão concluída!")