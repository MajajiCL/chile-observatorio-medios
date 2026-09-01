# -*- coding: utf-8 -*-
import logging
from datetime import datetime
from typing import Dict, List, Any
import httpx
from sqlalchemy.orm import Session
from db.models import EconomicIndicator

logger = logging.getLogger("ingestion.economic")

class EconomicIndicatorConnector:
    """
    Conector en tiempo real para indicadores macroeconómicos oficiales de Chile
    (UF, Dólar Observado, Euro, IPC, UTM, Imacec, TPM).
    Permite contrastar coberturas periodísticas con cifras oficiales del Banco Central de Chile.
    """

    MINDICADOR_URL = "https://mindicador.cl/api"

    @classmethod
    async def fetch_and_store_indicators(cls, db: Session) -> Dict[str, Any]:
        """Descarga los últimos valores oficiales y los persiste en la base de datos."""
        stats = {"fetched": 0, "updated": 0}
        
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(cls.MINDICADOR_URL)
                if resp.status_code == 200:
                    data = resp.json()
                    
                    indicators_map = [
                        ("uf", "Unidad de Fomento (UF)", "CLP", "Banco Central de Chile"),
                        ("dolar", "Dólar Observado", "CLP", "Banco Central de Chile"),
                        ("euro", "Euro", "CLP", "Banco Central de Chile"),
                        ("ipc", "Índice de Precios al Consumidor (IPC)", "%", "Instituto Nacional de Estadísticas (INE)"),
                        ("utm", "Unidad Tributaria Mensual (UTM)", "CLP", "Servicio de Impuestos Internos (SII)"),
                        ("imacec", "Imacec", "%", "Banco Central de Chile"),
                        ("tpm", "Tasa de Política Monetaria (TPM)", "%", "Banco Central de Chile")
                    ]

                    for key, name, unit, source in indicators_map:
                        if key in data and "valor" in data[key]:
                            val = float(data[key]["valor"])
                            date_str = data[key].get("fecha")
                            try:
                                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00")).replace(tzinfo=None)
                            except Exception:
                                dt = datetime.utcnow()

                            # Guardar o actualizar
                            existing = db.query(EconomicIndicator).filter(EconomicIndicator.code == key.upper()).first()
                            if not existing:
                                ind = EconomicIndicator(
                                    code=key.upper(),
                                    name=name,
                                    value=val,
                                    unit=unit,
                                    date=dt,
                                    source=source,
                                    updated_at=datetime.utcnow()
                                )
                                db.add(ind)
                                stats["fetched"] += 1
                            else:
                                existing.value = val
                                existing.date = dt
                                existing.updated_at = datetime.utcnow()
                                stats["updated"] += 1

                    db.commit()
                    logger.info(f"Indicadores económicos actualizados: {stats}")
                    return stats
                else:
                    logger.warning(f"Respuesta HTTP {resp.status_code} al consultar indicadores económicos.")
                    return stats
        except Exception as e:
            logger.error(f"Error al consultar indicadores macroeconómicos: {e}")
            return stats
