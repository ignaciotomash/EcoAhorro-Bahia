import requests
import unicodedata
import json

def eliminar_acentos(texto):
    if not texto: return ""
    return "".join(c for c in unicodedata.normalize('NFD', str(texto))
                  if unicodedata.category(c) != 'Mn').upper().strip()

def scrapper_vea_bahia():
    # API de Vea (Cencosud)
    url = "https://www.vea.com.ar/api/dataentities/NT/search?_fields=name,geocoordinates,address&_where=isActive=true&_from=0&_to=999"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "REST-Range": "resources=0-1000"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        print(f"Total de sucursales recibidas del servidor: {len(data)}")
        
        sucursales_bahia = []
        
        for item in data:
            name = item.get("name", "")
            address = item.get("address", "")
            
            # Normalizamos para la comparación
            info_busqueda = eliminar_acentos(f"{name} {address}")
            
            if "BAHIA BLANCA" in info_busqueda:
                coords = item.get("geocoordinates")
                
                if coords:
                    try:
                        # La API de Vea devuelve "lat,long"
                        lat_str, lng_str = coords.split(',')
                        
                        sucursales_bahia.append({
                            "nombre": f"Vea - {name}",
                            "direccion": address,
                            "latitud": float(lat_str),
                            "longitud": float(lng_str),
                            "supermercadoId": 3 # Asumiendo 3 para Vea (Coope era 2)
                        })
                    except (ValueError, TypeError):
                        continue 
        
        return sucursales_bahia

    except Exception as e:
        print(f"Error al scrapear Vea: {e}")
        return []

if __name__ == "__main__":
    locales = scrapper_vea_bahia()
    
    if locales:
        nombre_archivo = 'sucursales_vea.json'
        with open(nombre_archivo, 'w', encoding='utf-8') as f:
            json.dump(locales, f, indent=4, ensure_ascii=False)
        
        print(f"✅ Éxito: Se encontraron {len(locales)} sucursales de Vea.")
        print(f"📂 Archivo generado: {nombre_archivo}")
        
        # Muestra una muestra para verificar
        for l in locales[:3]:
            print(f"-> {l['nombre']} en {l['direccion']}")
    else:
        print("❌ No se encontraron locales o hubo un error.")