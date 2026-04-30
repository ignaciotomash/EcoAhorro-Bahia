import asyncio
import re
import logging
import csv
import aiohttp
from playwright.async_api import async_playwright

# Configuración de Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
logger = logging.getLogger()

async def consultar_producto(session, ean):
    """Consulta la API de VTEX para obtener detalles del producto."""
    url = f"https://www.vea.com.ar/api/catalog_system/pub/products/search?fq=alternateIds_Ean:{ean}"
    try:
        async with session.get(url, timeout=10) as resp:
            if resp.status == 200:
                data = await resp.json()
                if data:
                    p = data[0]
                    items = p.get('items', [])
                    # Estructuramos la fila para el CSV
                    return [
                        ean, 
                        p.get('productName', 'N/A'), 
                        p.get('brand', 'N/A'), 
                        items[0].get('name', 'N/A') if items else 'N/A',
                        p.get('categoryId', 'N/A'),
                        items[0]['sellers'][0]['commertialOffer']['Price'] if items and items[0].get('sellers') else 0
                    ]
    except Exception as e:
        logger.error(f"Error en API para EAN {ean}: {e}")
    return None

async def main():
    archivo_salida = "productos_vea.csv"
    
    # 1. Preparamos el CSV (Encabezados)
    with open(archivo_salida, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL)
        writer.writerow(["ID/EAN", "NOMBRE", "MARCA", "PRESENTACION", "ID_CATEGORIA", "PRECIO"])

    # 2. Mapeo de Categorías (Limpiado y sin duplicados)
    mapeo_categorias = {
        1: "bebidas", 2: "almacen", 3: "frutas-y-verduras", 4: "carnes",
        5: "lacteos", 6: "limpieza", 7: "electro", 8: "tiempo-libre",
        9: "perfumeria", 10: "mundo-bebe", 12: "congelados",
        13: "panaderia-y-pasteleria", 14: "pastas-frescas",
        15: "rotiseria", 16: "mascotas", 17: "hogar-y-textil"
    }
    
    url_base = "https://www.vea.com.ar/"
    todos_los_eans = set()

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        # AQUÍ ESTÁ EL MOTOR: La sesión de aiohttp
        async with aiohttp.ClientSession() as session:
            for id_cat, slug_cat in mapeo_categorias.items():
                url_categoria = f"{url_base}{slug_cat}"
                logger.info(f"\n--- EXPLORANDO: {slug_cat.upper()} ---")
                pagina = 1

                while True:
                    url_paginada = f"{url_categoria}?page={pagina}"
                    logger.info(f"Página {pagina} -> {url_paginada}")
                    
                    try:
                        await page.goto(url_paginada, wait_until="domcontentloaded", timeout=60000)
                        await asyncio.sleep(4) # Tiempo para renderizado de productos
                        
                        html = await page.content()
                        eans_encontrados = set(re.findall(r'\b7\d{12}\b', html))
                        
                        if not eans_encontrados:
                            logger.info(f"Fin de {slug_cat}: No se detectaron EANs.")
                            break
                        
                        nuevos = eans_encontrados - todos_los_eans
                        
                        if nuevos:
                            # Enriquecimiento masivo vía API
                            tareas = [consultar_producto(session, ean) for ean in nuevos]
                            resultados = await asyncio.gather(*tareas)
                            
                            # Guardado inmediato (Streaming)
                            with open(archivo_salida, mode='a', newline='', encoding='utf-8') as f:
                                writer = csv.writer(f, quoting=csv.QUOTE_ALL)
                                for r in resultados:
                                    if r: writer.writerow(r)
                            
                            todos_los_eans.update(nuevos)
                            logger.info(f"✅ +{len(nuevos)} productos guardados.")
                        else:
                            logger.info("Página repetida o sin novedades. Saltando...")
                            break
                        
                        pagina += 1
                        
                    except Exception as e:
                        logger.error(f"Error en {slug_cat} pág {pagina}: {e}")
                        break

        await browser.close()
    
    logger.info(f"🚀 PROCESO TERMINADO. Total unívocos: {len(todos_los_eans)}")

if __name__ == "__main__":
    asyncio.run(main())