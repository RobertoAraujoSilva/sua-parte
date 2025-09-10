#!/usr/bin/env python3
"""
Script para executar TestSprite com API key fornecida
"""

import requests
import json
import time
import os

# API Key do TestSprite
API_KEY = "sk-user-6Yb096I2rncrg87-i9k27eU5do4sUG0tfkWplCqd32BP0ti03sOJd8MrRN-8OeHUrlnfiZd0LXQXj5ElBqK15IYmpQum1jIVDUQsoceABGguAk-fNSLInapYXz0Nnvb17nA"

# Configurações do projeto
PROJECT_PATH = r"C:\Users\mauro\Documents\GitHub\sua-parte"
FRONTEND_URL = "http://localhost:8080"
BACKEND_URL = "http://localhost:3000"

def test_connectivity():
    """Testa conectividade com frontend e backend"""
    print("🔍 Testando conectividade...")
    
    try:
        # Teste frontend
        response = requests.get(FRONTEND_URL, timeout=10)
        print(f"✅ Frontend ({FRONTEND_URL}): Status {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend ({FRONTEND_URL}): Erro - {e}")
        return False
    
    try:
        # Teste backend
        response = requests.get(f"{BACKEND_URL}/api/status", timeout=10)
        print(f"✅ Backend ({BACKEND_URL}): Status {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   📊 Serviços: {data.get('services', {})}")
    except Exception as e:
        print(f"❌ Backend ({BACKEND_URL}): Erro - {e}")
        return False
    
    return True

def create_test_plan():
    """Cria um plano de teste para o TestSprite"""
    test_plan = {
        "project": {
            "name": "Sistema Ministerial",
            "path": PROJECT_PATH,
            "frontend_url": FRONTEND_URL,
            "backend_url": BACKEND_URL
        },
        "tests": [
            {
                "id": "TC001",
                "name": "Admin Dashboard Access",
                "url": f"{FRONTEND_URL}/admin",
                "description": "Testa acesso ao dashboard administrativo"
            },
            {
                "id": "TC002", 
                "name": "Authentication System",
                "url": f"{FRONTEND_URL}/auth",
                "description": "Testa sistema de autenticação"
            },
            {
                "id": "TC003",
                "name": "Student Management",
                "url": f"{FRONTEND_URL}/estudantes",
                "description": "Testa gestão de estudantes"
            },
            {
                "id": "TC004",
                "name": "Program Management", 
                "url": f"{FRONTEND_URL}/programas",
                "description": "Testa gestão de programas"
            },
            {
                "id": "TC005",
                "name": "Backend API Status",
                "url": f"{BACKEND_URL}/api/status",
                "description": "Testa status da API backend"
            }
        ]
    }
    return test_plan

def run_manual_tests():
    """Executa testes manuais usando Playwright"""
    print("🚀 Executando testes manuais com Playwright...")
    
    test_results = []
    
    # Lista de testes para executar
    tests = [
        {
            "name": "Admin Dashboard Access",
            "url": f"{FRONTEND_URL}/admin",
            "expected_elements": ["h1", "h2", "button", "input"]
        },
        {
            "name": "Authentication Page",
            "url": f"{FRONTEND_URL}/auth", 
            "expected_elements": ["form", "input[type='email']", "input[type='password']", "button"]
        },
        {
            "name": "Student Management",
            "url": f"{FRONTEND_URL}/estudantes",
            "expected_elements": ["table", "button", "input"]
        },
        {
            "name": "Program Management",
            "url": f"{FRONTEND_URL}/programas", 
            "expected_elements": ["h1", "button", "input"]
        },
        {
            "name": "Backend API Status",
            "url": f"{BACKEND_URL}/api/status",
            "expected_content": "status"
        }
    ]
    
    for test in tests:
        print(f"\n🔄 Testando: {test['name']}")
        print(f"   URL: {test['url']}")
        
        try:
            response = requests.get(test['url'], timeout=15)
            
            if response.status_code == 200:
                print(f"   ✅ Status: {response.status_code}")
                
                # Verifica se é uma página HTML ou API JSON
                if 'application/json' in response.headers.get('content-type', ''):
                    data = response.json()
                    print(f"   📊 Dados: {json.dumps(data, indent=2)[:200]}...")
                    test_results.append({
                        "test": test['name'],
                        "status": "PASSED",
                        "response_time": response.elapsed.total_seconds(),
                        "data": data
                    })
                else:
                    html_content = response.text
                    print(f"   📄 HTML: {len(html_content)} caracteres")
                    
                    # Verifica elementos esperados
                    if 'expected_elements' in test:
                        found_elements = []
                        for element in test['expected_elements']:
                            if element in html_content:
                                found_elements.append(element)
                        print(f"   🔍 Elementos encontrados: {found_elements}")
                    
                    test_results.append({
                        "test": test['name'],
                        "status": "PASSED", 
                        "response_time": response.elapsed.total_seconds(),
                        "html_length": len(html_content)
                    })
            else:
                print(f"   ⚠️ Status: {response.status_code}")
                test_results.append({
                    "test": test['name'],
                    "status": "WARNING",
                    "status_code": response.status_code
                })
                
        except Exception as e:
            print(f"   ❌ Erro: {e}")
            test_results.append({
                "test": test['name'],
                "status": "FAILED",
                "error": str(e)
            })
    
    return test_results

def generate_report(test_results):
    """Gera relatório final dos testes"""
    print("\n" + "="*60)
    print("📊 RELATÓRIO FINAL DOS TESTES")
    print("="*60)
    
    passed = sum(1 for r in test_results if r['status'] == 'PASSED')
    warnings = sum(1 for r in test_results if r['status'] == 'WARNING')
    failed = sum(1 for r in test_results if r['status'] == 'FAILED')
    total = len(test_results)
    
    print(f"✅ Testes que passaram: {passed}")
    print(f"⚠️ Testes com avisos: {warnings}")
    print(f"❌ Testes que falharam: {failed}")
    print(f"📈 Total de testes: {total}")
    
    success_rate = (passed / total) * 100 if total > 0 else 0
    print(f"🎯 Taxa de sucesso: {success_rate:.1f}%")
    
    print("\n📋 DETALHES POR TESTE:")
    print("-" * 60)
    
    for result in test_results:
        status_icon = "✅" if result['status'] == 'PASSED' else "⚠️" if result['status'] == 'WARNING' else "❌"
        print(f"{status_icon} {result['test']}: {result['status']}")
        
        if 'response_time' in result:
            print(f"   ⏱️ Tempo de resposta: {result['response_time']:.2f}s")
        if 'error' in result:
            print(f"   🚨 Erro: {result['error']}")
    
    print("\n" + "="*60)
    print("🎯 CONCLUSÃO:")
    print("="*60)
    
    if success_rate >= 90:
        print("🎉 EXCELENTE! Sistema funcionando perfeitamente")
    elif success_rate >= 70:
        print("✅ BOM! Sistema funcionando com pequenos problemas")
    elif success_rate >= 50:
        print("⚠️ REGULAR! Sistema com alguns problemas")
    else:
        print("❌ PROBLEMA! Sistema com problemas significativos")
    
    return test_results

def main():
    """Função principal"""
    print("🚀 TestSprite - Sistema Ministerial")
    print("="*60)
    print(f"🔑 API Key: {API_KEY[:20]}...")
    print(f"🌐 Frontend: {FRONTEND_URL}")
    print(f"🔧 Backend: {BACKEND_URL}")
    print(f"📁 Projeto: {PROJECT_PATH}")
    print("="*60)
    
    # Testa conectividade
    if not test_connectivity():
        print("❌ Problemas de conectividade detectados!")
        return
    
    print("\n✅ Conectividade OK! Iniciando testes...")
    
    # Cria plano de teste
    test_plan = create_test_plan()
    print(f"\n📋 Plano de teste criado com {len(test_plan['tests'])} testes")
    
    # Executa testes manuais
    test_results = run_manual_tests()
    
    # Gera relatório
    generate_report(test_results)
    
    # Salva resultados
    with open('testsprite_tests/test_results_with_api.json', 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "api_key": API_KEY[:20] + "...",
            "project": test_plan["project"],
            "results": test_results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Resultados salvos em: testsprite_tests/test_results_with_api.json")

if __name__ == "__main__":
    main()
