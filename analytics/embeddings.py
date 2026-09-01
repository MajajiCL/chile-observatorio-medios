# -*- coding: utf-8 -*-
import math
import re
import hashlib
import unicodedata
from collections import Counter
from typing import List, Dict, Tuple
import numpy as np

SPANISH_STOPWORDS = {
    "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para",
    "con", "no", "una", "su", "al", "lo", "como", "mas", "pero", "sus", "le", "ya", "o",
    "este", "si", "porque", "esta", "entre", "cuando", "muy", "sin", "sobre", "tambien",
    "me", "hasta", "hay", "donde", "quien", "desde", "todo", "nos", "durante", "todos",
    "uno", "les", "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "e", "esto",
    "mi", "antes", "algunos", "unos", "yo", "otro", "otras", "otra", "tanto",
    "esa", "estos", "mucho", "quienes", "nada", "muchos", "cual", "poco", "ella", "estar",
    "estas", "algunas", "algo", "nosotros", "mis", "tu", "te", "ti", "tus", "ellas",
    "nosotras", "mio", "mia", "mios", "mias", "tuyo", "tuya", "tuyos", "tuyas", "suyo", "suya",
    "nuestro", "nuestra", "nuestros", "nuestras", "esos", "esas", "estos",
    "tras", "segun", "afirmo", "senalo", "agrego", "informo", "aseguro", "dijo", "hoy",
    "ayer", "ano", "anos", "dio", "cuenta", "hace"
}

def normalize_token(word: str) -> str:
    """Remueve acentos y pasa a minúsculas."""
    nfkd_form = unicodedata.normalize('NFKD', word.lower())
    clean = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    
    # Stemming ligero en español
    if len(clean) > 5:
        if clean.endswith("mente"):
            clean = clean[:-5]
        elif clean.endswith(("acion", "icion", "idad")):
            clean = clean[:-4]
        elif clean.endswith(("aron", "ieron", "aran", "eran", "ando", "iendo")):
            clean = clean[:-4]
        elif clean.endswith(("es", "os", "as")):
            clean = clean[:-2]
        elif clean.endswith(("a", "e", "o", "s")):
            clean = clean[:-1]
    return clean

class SemanticVectorEngine:
    """
    Motor semántico para representación vectorial en español.
    Utiliza tokenización ponderada (TF-IDF adaptativo con n-gramas, hash MD5 determinista y normalización L2).
    """
    
    VOCAB_SIZE = 512

    @classmethod
    def tokenize(cls, text: str) -> List[str]:
        """Tokeniza y extrae palabras clave con n-gramas informativos."""
        if not text:
            return []
        
        words = re.findall(r'\b[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}\b', text)
        cleaned = [normalize_token(w) for w in words]
        filtered = [w for w in cleaned if w not in SPANISH_STOPWORDS and len(w) > 2]
        
        # Agregar bigramas informativos
        bigrams = []
        for i in range(len(filtered) - 1):
            bigrams.append(f"{filtered[i]}_{filtered[i+1]}")
            
        return filtered + bigrams

    @classmethod
    def _deterministic_hash(cls, token: str) -> int:
        """Hash determinista para evitar diferencias entre procesos."""
        return int(hashlib.md5(token.encode('utf-8')).hexdigest()[:8], 16) % cls.VOCAB_SIZE

    @classmethod
    def compute_embedding(cls, title: str, text: str = "") -> List[float]:
        """
        Calcula un vector unitario denso a partir del título (mayor peso) y texto.
        """
        tokens_title = cls.tokenize(title) * 4 # Cuádruple ponderación al título
        tokens_text = cls.tokenize(text[:1500])
        all_tokens = tokens_title + tokens_text
        
        if not all_tokens:
            return [0.0] * cls.VOCAB_SIZE

        counts = Counter(all_tokens)
        vector = np.zeros(cls.VOCAB_SIZE, dtype=np.float32)
        
        for token, count in counts.items():
            idx = cls._deterministic_hash(token)
            tf = 1.0 + math.log(count)
            vector[idx] += tf

        # Normalización L2
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm

        return vector.tolist()

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Calcula la similitud coseno entre dos vectores normalizados."""
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        return float(max(0.0, min(1.0, dot)))
