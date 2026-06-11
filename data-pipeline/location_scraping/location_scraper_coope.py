import json
import unicodedata

def eliminar_acentos(texto):
    if not texto: return ""
    # Normaliza y quita acentos, pasa a mayúsculas y quita espacios extra
    return "".join(c for c in unicodedata.normalize('NFD', str(texto))
                  if unicodedata.category(c) != 'Mn').upper().strip()

def leer_coope_desde_archivo():
    try:
        # Usamos utf-8-sig por seguridad con archivos de Windows
        with open('coope_location.json', 'r', encoding='utf-8-sig') as f:
            resultado = json.load(f)
        
        # Cambiamos "data" por "content" que es lo que muestra tu archivo
        data = resultado.get("content", [])
        
        sucursales_bahia = []
        
        for item in data:
            ciudad_raw = item.get("city", "")
            ciudad_limpia = eliminar_acentos(ciudad_raw)
            
            # Filtramos por Bahía Blanca
            if "BAHIA BLANCA" in ciudad_limpia:
                try:
                    sucursales_bahia.append({
                        "nombre": f"Cooperativa Obrera - {item.get('name')}",
                        "direccion": item.get("address"),
                        "latitud": float(item.get("latitude")),
                        "longitud": float(item.get("longitude")),
                        "supermercadoId": 2
                    })
                except (TypeError, ValueError):
                    continue # Salta si las coordenadas no son números
        
        return sucursales_bahia

    except FileNotFoundError:
        print("Error: No se encontró el archivo coope_location.json")
        return []
    except Exception as e:
        print(f"Error inesperado: {e}")
        return []

if __name__ == "__main__":
    locales = leer_coope_desde_archivo()
    
    if locales:
        # Guardamos en un archivo específico para este comercio
        nombre_archivo = 'sucursales_coope.json'
        
        with open(nombre_archivo, 'w', encoding='utf-8') as f:
                         #4 espacios de identacio  #agregando acentos para mejor legibilidad (antes aparecian en ascii)
            json.dump(locales, f, indent=4, ensure_ascii=False)
        
        print(f"✅ Éxito: Se encontraron {len(locales)} sucursales.")
        print(f"📂 Archivo generado: {nombre_archivo}")
    else:
        print("❌ Error: No se pudieron procesar las sucursales.")