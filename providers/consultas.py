import datetime
import requests
import logging

logger = logging.getLogger(__name__)

def get_tipo_de_cambio():
    """
    Consulta el tipo de cambio del DOF (Diario Oficial de la Federación) usando la API oficial.

    - Si es sábado o domingo, toma el último día hábil (viernes).
    - Si la API devuelve un código 200, regresa el valor del tipo de cambio como float.
    - Si hay error en la respuesta o en la conexión, regresa 0.0.

    Returns:
        float: Tipo de cambio obtenido del DOF o 0.0 en caso de error.
    """
    try:
        # Obtener la fecha actual con zona horaria UTC-6 (México)
        timezone_mx = datetime.timezone(datetime.timedelta(hours=-6))
        ahora = datetime.datetime.now(timezone_mx)
        dia_semana = ahora.weekday()  # Lunes = 0, Domingo = 6

        # Ajustar fecha si es fin de semana
        if dia_semana == 6:  # Domingo
            fecha_objetivo = ahora - datetime.timedelta(days=2)
        elif dia_semana == 5:  # Sábado
            fecha_objetivo = ahora - datetime.timedelta(days=1)
        else:
            fecha_objetivo = ahora

        fecha_str = fecha_objetivo.strftime("%d-%m-%Y")
        url = f"https://sidofqa.segob.gob.mx/dof/sidof/indicadores/{fecha_str}"

        # Realizar la solicitud
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Lanza error si no es 200 OK

        data = response.json()

        if data.get("messageCode") == 200:
            valor = data.get("ListaIndicadores", [{}])[0].get("valor")
            return float(valor) if valor else 0.0
        else:
            logger.warning(f"Respuesta inesperada de la API DOF: {data}")
            return 0.0

    except (requests.RequestException, ValueError, KeyError) as e:
        logger.error(f"Error al consultar tipo de cambio DOF: {e}")
        return 0.0
