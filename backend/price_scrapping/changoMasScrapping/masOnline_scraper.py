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
    url = f"https://www.masonline.com.ar/api/catalog_system/pub/products/search?fq=alternateIds_Ean:{ean}"
    try:
        async with session.get(url, timeout=10) as resp:
            if resp.status == 200:
                data = await resp.json()
                if data:
                    product = data[0]
                    items = product.get('items', [])
                    # Estructuramos la fila para el CSV
                    return [
                        ean, 
                        product.get('productName', 'N/A'), 
                        product.get('brand', 'N/A'), 
                        items[0].get('name', 'N/A') if items else 'N/A',
                        product.get('categoryId', 'N/A'),
                        items[0]['sellers'][0]['commertialOffer']['Price'] if items and items[0].get('sellers') else 0
                    ]
    except Exception as e:
        logger.error(f"Error en API para EAN {ean}: {e}")
    return None

async def main():
    output_file = "productos_chango_mas.csv"
    
    # 1. Preparamos el CSV (Encabezados)
    with open(output_file, mode='w', newline='', encoding='utf-8') as csv_file:
        writer = csv.writer(csv_file, quoting=csv.QUOTE_ALL)
        writer.writerow(["ID/EAN", "NOMBRE", "MARCA", "PRESENTACION", "ID_CATEGORIA", "PRECIO"])

    # 2. Mapeo de Categorías de ChangoMas (changoMas identifica en la url a su categoría con un número)
    mapeo_categorias = {
        1: "3454",  #almacen
        2: "3431",  #carnicería, pescadería y verdulería
        3: "3432",  #frescos y congelados
        4: "3433",  #bebidas
        5: "3455",  #perfumeria
        6: "3434",  #belleza
        7: "272",   #limpieza
        8: "273",   #bebes y niños
        9: "3435",  #mascotas
        10: "3436", #hogar
        11: "262",  #electrodomesticos
        12: "275",  #tecnologia
        13: "3437", #deportes ocio y aire libre
        14: "3438", #automotor
        15: "3688"  #indumentaria
    }
    
    base_url = "https://www.masonline.com.ar/"
    all_scraped_eans = set()

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        # AQUÍ ESTÁ EL MOTOR: La sesión de aiohttp
        async with aiohttp.ClientSession() as session:
            for category_index, category_id in mapeo_categorias.items():
                url_categoria = f"{base_url}{category_id}"
                logger.info(f"\n--- EXPLORANDO: Categoría {category_index} (ID: {category_id}) ---")
                page_number = 1

                while True:
                    paginated_url = f"{url_categoria}?map=productClusterIds&page={page_number}"
                    logger.info(f"Página {page_number} -> {paginated_url}")
                    
                    try:
                        await page.goto(paginated_url, wait_until="domcontentloaded", timeout=60000)
                        await asyncio.sleep(4) # Tiempo para renderizado de productos
                        
                        html_content = await page.content()
                        found_eans = set(re.findall(r'\b7\d{12}\b', html_content))
                        
                        if not found_eans:
                            logger.info(f"Fin de categoría {category_index}: No se detectaron EANs.")
                            break
                        
                        new_eans = found_eans - all_scraped_eans
                        
                        if new_eans:
                            # Enriquecimiento masivo vía API
                            api_tasks = [consultar_producto(session, ean) for ean in new_eans]
                            api_results = await asyncio.gather(*api_tasks)
                            
                            # Guardado inmediato (Streaming)
                            with open(output_file, mode='a', newline='', encoding='utf-8') as csv_file:
                                writer = csv.writer(csv_file, quoting=csv.QUOTE_ALL)
                                for product_result in api_results:
                                    if product_result: writer.writerow(product_result)
                            
                            all_scraped_eans.update(new_eans)
                            logger.info(f"✅ +{len(new_eans)} productos guardados.")
                        else:
                            logger.info("Página repetida o sin novedades. Saltando...")
                            break
                        
                        page_number += 1
                        
                    except Exception as e:
                        logger.error(f"Error en categoría {category_index} pág {page_number}: {e}")
                        break

        await browser.close()
    
    logger.info(f"🚀 PROCESO TERMINADO. Total unívocos: {len(all_scraped_eans)}")

if __name__ == "__main__":
    asyncio.run(main())