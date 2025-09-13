#!/usr/bin/env python3
"""
Script para converter o arquivo Excel 'estudantes_ficticios.xlsx' para JSON
Formato compatível com a função process_estudantes_batch do Supabase
"""

import pandas as pd
import json
import uuid
from datetime import datetime
import os

def convert_excel_to_json(excel_file_path, output_file_path):
    """
    Converte o arquivo Excel para JSON no formato esperado pelo Supabase
    """
    try:
        # Ler o arquivo Excel
        print(f"Lendo arquivo Excel: {excel_file_path}")
        df = pd.read_excel(excel_file_path)
        
        print(f"Total de registros encontrados: {len(df)}")
        print(f"Colunas disponíveis: {list(df.columns)}")
        
        # Lista para armazenar os registros convertidos
        records = []
        
        # Processar cada linha
        for index, row in df.iterrows():
            try:
                # Criar registro com mapeamento das colunas
                record = {
                    # Campos obrigatórios
                    "id": str(row.get('id', gen_uuid())),
                    "nome": str(row.get('nome', '')).strip(),
                    
                    # Campos opcionais com valores padrão
                    "sobrenome": str(row.get('Sobrenome', '')).strip() if pd.notna(row.get('Sobrenome')) else None,
                    "idade": int(row.get('idade', 0)) if pd.notna(row.get('idade')) and row.get('idade') > 0 else None,
                    "genero": normalize_genero(row.get('genero', '')),
                    "email": str(row.get('email', '')).strip() if pd.notna(row.get('email')) else None,
                    "telefone": str(row.get('telefone', '')).strip() if pd.notna(row.get('telefone')) else None,
                    "data_batismo": normalize_date(row.get('data_batismo')),
                    "servico": str(row.get('servico', '')).strip() if pd.notna(row.get('servico')) else None,
                    "cargo": normalize_cargo(row.get('cargo', '')),
                    "id_pai_mae": str(row.get('id_pai_mae', '')) if pd.notna(row.get('id_pai_mae')) and str(row.get('id_pai_mae')) != 'nan' else None,
                    "ativo": bool(row.get('ativo', True)) if pd.notna(row.get('ativo')) else True,
                    "observacoes": str(row.get('observacoes', '')).strip() if pd.notna(row.get('observacoes')) and str(row.get('observacoes')) != 'desconhecido' else None,
                    "estado_civil": normalize_estado_civil(row.get('estado_civil', '')),
                    "papel_familiar": normalize_papel_familiar(row.get('papel_familiar', '')),
                    "id_pai": str(row.get('id_pai', '')) if pd.notna(row.get('id_pai')) and str(row.get('id_pai')) != 'nan' else None,
                    "id_mae": str(row.get('id_mae', '')) if pd.notna(row.get('id_mae')) and str(row.get('id_mae')) != 'nan' else None,
                    "id_conjuge": str(row.get('id_conjugue', '')) if pd.notna(row.get('id_conjugue')) and str(row.get('id_conjugue')) != 'nan' else None,
                    "coalizacao": bool(row.get('coalizacao', False)) if pd.notna(row.get('coalizacao')) else False,
                    "menor": bool(row.get('menor', False)) if pd.notna(row.get('menor')) else False,
                    "responsavel_primario": str(row.get('responsavel_primario', '')) if pd.notna(row.get('responsavel_primario')) and str(row.get('responsavel_primario')) != 'nan' else None,
                    "responsavel_secundario": str(row.get('responsavel_secundario', '')) if pd.notna(row.get('responsavel_secundario')) and str(row.get('responsavel_secundario')) != 'nan' else None,
                    
                    # Campos booleanos de aptidão
                    "chairman": bool(row.get('chairman', False)) if pd.notna(row.get('chairman')) else False,
                    "pray": bool(row.get('pray', False)) if pd.notna(row.get('pray')) else False,
                    "tresures": bool(row.get('tresures', False)) if pd.notna(row.get('tresures')) else False,
                    "gems": bool(row.get('gems', False)) if pd.notna(row.get('gems')) else False,
                    "reading": bool(row.get('reading', False)) if pd.notna(row.get('reading')) else False,
                    "starting": bool(row.get('starting', False)) if pd.notna(row.get('starting')) else False,
                    "following": bool(row.get('following', False)) if pd.notna(row.get('following')) else False,
                    "making": bool(row.get('making', False)) if pd.notna(row.get('making')) else False,
                    "explaining": bool(row.get('explaining', False)) if pd.notna(row.get('explaining')) else False,
                    "talk": bool(row.get('talk', False)) if pd.notna(row.get('talk')) else False,
                    
                    # Data de nascimento
                    "data_nascimento": normalize_date(row.get('data_nascimento'))
                }
                
                # Remover campos None para economizar espaço
                record = {k: v for k, v in record.items() if v is not None}
                
                records.append(record)
                
            except Exception as e:
                print(f"Erro ao processar linha {index + 1}: {e}")
                print(f"Dados da linha: {row.to_dict()}")
                continue
        
        # Salvar como JSON
        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Conversão concluída com sucesso!")
        print(f"📁 Arquivo JSON salvo em: {output_file_path}")
        print(f"📊 Total de registros processados: {len(records)}")
        
        # Mostrar alguns exemplos
        if records:
            print(f"\n📋 Exemplo do primeiro registro:")
            print(json.dumps(records[0], ensure_ascii=False, indent=2))
        
        return records
        
    except Exception as e:
        print(f"❌ Erro ao processar arquivo: {e}")
        return None

def gen_uuid():
    """Gera um UUID único"""
    return str(uuid.uuid4())

def normalize_genero(genero):
    """Normaliza o campo gênero"""
    if pd.isna(genero):
        return 'masculino'  # valor padrão
    
    genero_str = str(genero).lower().strip()
    if genero_str in ['m', 'masculino', 'male']:
        return 'masculino'
    elif genero_str in ['f', 'feminino', 'female']:
        return 'feminino'
    else:
        return 'masculino'  # valor padrão

def normalize_cargo(cargo):
    """Normaliza o campo cargo"""
    if pd.isna(cargo):
        return 'estudante_novo'  # valor padrão
    
    cargo_str = str(cargo).lower().strip()
    cargos_validos = {
        'anciao': 'anciao',
        'servo_ministerial': 'servo_ministerial',
        'pioneiro_regular': 'pioneiro_regular',
        'publicador_batizado': 'publicador_batizado',
        'publicador_nao_batizado': 'publicador_nao_batizado',
        'estudante_novo': 'estudante_novo'
    }
    
    return cargos_validos.get(cargo_str, 'estudante_novo')

def normalize_estado_civil(estado):
    """Normaliza o campo estado civil"""
    if pd.isna(estado) or str(estado).lower().strip() == 'desconhecido':
        return 'desconhecido'
    
    estado_str = str(estado).lower().strip()
    estados_validos = {
        'solteiro': 'solteiro',
        'casado': 'casado',
        'viuvo': 'viuvo',
        'desconhecido': 'desconhecido'
    }
    
    return estados_validos.get(estado_str, 'desconhecido')

def normalize_papel_familiar(papel):
    """Normaliza o campo papel familiar"""
    if pd.isna(papel):
        return None
    
    papel_str = str(papel).lower().strip()
    papeis_validos = {
        'pai': 'pai',
        'mae': 'mae',
        'filho': 'filho',
        'filha': 'filha',
        'filho_adulto': 'filho_adulto',
        'filha_adulta': 'filha_adulta'
    }
    
    return papeis_validos.get(papel_str, None)

def normalize_date(date_value):
    """Normaliza campos de data"""
    if pd.isna(date_value):
        return None
    
    try:
        if isinstance(date_value, str):
            # Tentar converter string para data
            return pd.to_datetime(date_value).strftime('%Y-%m-%d')
        elif isinstance(date_value, datetime):
            # Já é datetime
            return date_value.strftime('%Y-%m-%d')
        else:
            # Tentar converter outros tipos
            return pd.to_datetime(date_value).strftime('%Y-%m-%d')
    except:
        return None

def main():
    """Função principal"""
    print("🔄 Conversor de Excel para JSON - Sistema Ministerial")
    print("=" * 60)
    
    # Caminhos dos arquivos
    excel_file = "docs/Oficial/estudantes_ficticios_refinado.xlsx"
    output_file = "estudantes_refinados_converted.json"
    
    # Verificar se o arquivo Excel existe
    if not os.path.exists(excel_file):
        print(f"❌ Arquivo Excel não encontrado: {excel_file}")
        print("📁 Verifique se o arquivo está no caminho correto")
        return
    
    # Converter Excel para JSON
    records = convert_excel_to_json(excel_file, output_file)
    
    if records:
        print(f"\n🎯 Próximos passos:")
        print(f"1. Verifique o arquivo JSON gerado: {output_file}")
        print(f"2. Use a função process_estudantes_batch no Supabase")
        print(f"3. Execute: SELECT process_estudantes_batch('SEU_JSON_AQUI'::JSONB);")
        
        # Gerar comando SQL de exemplo
        print(f"\n💡 Comando SQL de exemplo:")
        print(f"SELECT process_estudantes_batch('{json.dumps(records[:2], ensure_ascii=False)}'::JSONB);")

if __name__ == "__main__":
    main()
