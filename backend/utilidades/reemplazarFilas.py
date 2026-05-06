import pandas as pd

# ==========================================
# CONFIGURACIÓN DE ARCHIVOS
# ==========================================
ARCHIVO_ORIGINAL = 'segundo_archivo.csv'  # El archivo que quieres modificar
ARCHIVO_CON_CAMBIOS = 'primero_archivo.csv' # El archivo que tiene la info nueva
ARCHIVO_RESULTADO = 'archivo_actualizado.csv'
# ==========================================

try:
    # 1. Cargamos los archivos tratando el EAN como texto para no perder precisión
    df_target = pd.read_csv(ARCHIVO_ORIGINAL, dtype={'ID/EAN': str})
    df_source = pd.read_csv(ARCHIVO_CON_CAMBIOS, dtype={'ID/EAN': str})

    # 2. Establecemos el EAN como índice en ambos para poder compararlos directamente
    df_target.set_index('ID/EAN', inplace=True)
    df_source.set_index('ID/EAN', inplace=True)

    # 3. La función update() reemplaza los valores en df_target con los de df_source
    # Solo lo hace donde los índices (EAN) coinciden. No agrega filas nuevas.
    df_target.update(df_source)

    # 4. Volvemos a convertir el índice en una columna normal
    df_final = df_target.reset_index()

    # 5. Guardamos el resultado respetando el formato original
    df_final.to_csv(ARCHIVO_RESULTADO, index=False, quoting=1)

    print("Actualización completada.")
    print(f"Se han procesado las filas de '{ARCHIVO_ORIGINAL}' y se guardó en '{ARCHIVO_RESULTADO}'.")
    print(f"Total de filas mantenidas: {len(df_final)}")

except Exception as e:
    print(f"Ocurrió un error: {e}")